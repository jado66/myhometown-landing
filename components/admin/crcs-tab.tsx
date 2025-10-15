"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { City, Community, CRC } from "@/types/admin";
import { toast } from "sonner";

interface CRCsTabProps {
  crcs: CRC[];
  cities: City[];
  communities: Community[];
  onRefresh: () => void;
  onShowToast: (message: string, type: "success" | "error") => void;
}

export function CRCsTab({
  crcs,
  cities,
  communities,
  onRefresh,
  onShowToast,
}: CRCsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCRC, setEditingCRC] = useState<CRC | null>(null);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(
    []
  );
  const [showNewCommunityModal, setShowNewCommunityModal] = useState(false);
  const [showNewCityModal, setShowNewCityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCRC, setDeletingCRC] = useState<CRC | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [localCRCs, setLocalCRCs] = useState<CRC[]>(crcs);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newItemIds, setNewItemIds] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city_id: "",
    community_id: "",
    state: "",
    zip: "",
  });
  const [newCommunityData, setNewCommunityData] = useState({
    name: "",
    city_id: "",
    state: "",
    country: "USA",
    visibility: true,
  });
  const [newCityData, setNewCityData] = useState({
    name: "",
    state: "Utah",
    country: "USA",
    visibility: true,
    image_url: "",
  });

  useEffect(() => {
    setLocalCRCs(crcs);
  }, [crcs]);

  useEffect(() => {
    if (formData.city_id) {
      const filtered = communities.filter(
        (c) => c.city_id === formData.city_id
      );

      // Sort CRCs list by city name, then community name, then CRC name
      setLocalCRCs((prev) => {
        const next = [...prev];
        next.sort((a, b) => {
          const cityA = a.city?.name?.toLowerCase() || "";
          const cityB = b.city?.name?.toLowerCase() || "";
          if (cityA !== cityB) return cityA.localeCompare(cityB);

          return (a.name || "")
            .toLowerCase()
            .localeCompare((b.name || "").toLowerCase());
        });
        return next;
      });
      setFilteredCommunities(filtered);

      if (
        formData.community_id &&
        !filtered.find((c) => c.id === formData.community_id)
      ) {
        setFormData((prev) => ({ ...prev, community_id: "" }));
      }
    } else {
      setFilteredCommunities([]);
    }
  }, [formData.city_id, communities, formData.community_id]);

  useEffect(() => {
    if (newCommunityData.city_id) {
      const filtered = communities.filter(
        (c) => c.city_id === newCommunityData.city_id
      );
      setFilteredCommunities(filtered);
    }
  }, [newCommunityData.city_id, communities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingCRC ? "PUT" : "POST";
      const url = editingCRC
        ? `/api/admin/crcs/${editingCRC.id}`
        : "/api/admin/crcs";

      if (editingCRC) {
        const selectedCity = cities.find((c) => c.id === formData.city_id);
        const selectedCommunity = communities.find(
          (c) => c.id === formData.community_id
        );
        setLocalCRCs((prev) =>
          prev.map((crc) =>
            crc.id === editingCRC.id
              ? {
                  ...crc,
                  ...formData,
                  city: selectedCity,
                  community: selectedCommunity,
                }
              : crc
          )
        );
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save CRC");

      const savedCRC = await response.json();

      if (!editingCRC) {
        const selectedCity = cities.find((c) => c.id === formData.city_id);
        const selectedCommunity = communities.find(
          (c) => c.id === formData.community_id
        );
        setLocalCRCs((prev) => [
          ...prev,
          { ...savedCRC, city: selectedCity, community: selectedCommunity },
        ]);
        setNewItemIds((prev) => new Set(prev).add(savedCRC.id));
      } else {
        setLocalCRCs((prev) =>
          prev.map((crc) => (crc.id === savedCRC.id ? savedCRC : crc))
        );
      }

      onShowToast(
        editingCRC ? "CRC updated successfully!" : "CRC created successfully!",
        "success"
      );
      handleCloseModal();
      onRefresh();
    } catch (error) {
      console.error("Error saving CRC:", error);
      onShowToast("Failed to save CRC", "error");
      setLocalCRCs(crcs);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWithNewCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const communityResponse = await fetch("/api/admin/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCommunityData),
      });

      if (!communityResponse.ok) throw new Error("Failed to create community");

      const newCommunity = await communityResponse.json();

      const crcResponse = await fetch("/api/admin/crcs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          community_id: newCommunity.id,
          city_id: newCommunityData.city_id,
          state: newCommunityData.state,
        }),
      });

      if (!crcResponse.ok) throw new Error("Failed to create CRC");

      const newCRC = await crcResponse.json();

      const selectedCity = cities.find(
        (c) => c.id === newCommunityData.city_id
      );
      setLocalCRCs((prev) => [
        ...prev,
        { ...newCRC, city: selectedCity, community: newCommunity },
      ]);

      setNewItemIds((prev) => new Set(prev).add(newCRC.id));

      onShowToast("Community and CRC created successfully!", "success");
      handleCloseNewCommunityModal();
      onRefresh();
    } catch (error) {
      console.error("Error creating community and CRC:", error);
      onShowToast("Failed to create community and CRC", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWithNewCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cityResponse = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCityData),
      });

      if (!cityResponse.ok) throw new Error("Failed to create city");

      const newCity = await cityResponse.json();

      const communityResponse = await fetch("/api/admin/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCommunityData.name,
          city_id: newCity.id,
          state: newCityData.state,
          country: newCityData.country,
          visibility: newCommunityData.visibility,
        }),
      });

      if (!communityResponse.ok) throw new Error("Failed to create community");

      const newCommunity = await communityResponse.json();

      const crcResponse = await fetch("/api/admin/crcs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          community_id: newCommunity.id,
          city_id: newCity.id,
          state: newCityData.state,
        }),
      });

      if (!crcResponse.ok) throw new Error("Failed to create CRC");

      const newCRC = await crcResponse.json();

      setLocalCRCs((prev) => [
        ...prev,
        { ...newCRC, city: newCity, community: newCommunity },
      ]);

      setNewItemIds((prev) => new Set(prev).add(newCRC.id));

      onShowToast("City, community, and CRC created successfully!", "success");
      handleCloseNewCityModal();
      onRefresh();
    } catch (error) {
      console.error("Error creating city, community, and CRC:", error);
      onShowToast("Failed to create city, community, and CRC", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (crc: CRC) => {
    setDeletingCRC(crc);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCRC || deleteConfirmText !== deletingCRC.name) {
      onShowToast("CRC name does not match", "error");
      return;
    }

    setIsDeleting(true);

    try {
      setLocalCRCs((prev) => prev.filter((crc) => crc.id !== deletingCRC.id));

      const response = await fetch(`/api/admin/crcs/${deletingCRC.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete CRC");

      onShowToast("CRC deleted successfully!", "success");

      // Small delay before closing modal to ensure toast renders
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeletingCRC(null);
        setDeleteConfirmText("");
      }, 100);

      onRefresh();
    } catch (error) {
      console.error("Error deleting CRC:", error);
      onShowToast("Failed to delete CRC", "error");
      setLocalCRCs(crcs);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (crc: CRC) => {
    setEditingCRC(crc);
    setFormData({
      name: crc.name,
      address: crc.address,
      city_id: crc.city_id,
      community_id: crc.community_id,
      state: crc.state,
      zip: crc.zip,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCRC(null);
    setIsSubmitting(false);
    setFormData({
      name: "",
      address: "",
      city_id: "",
      community_id: "",
      state: "",
      zip: "",
    });
  };

  const handleCloseNewCommunityModal = () => {
    setShowNewCommunityModal(false);
    setIsSubmitting(false);
    setFormData({
      name: "",
      address: "",
      city_id: "",
      community_id: "",
      state: "",
      zip: "",
    });
    setNewCommunityData({
      name: "",
      city_id: "",
      state: "",
      country: "USA",
      visibility: true,
    });
  };

  const handleCloseNewCityModal = () => {
    setShowNewCityModal(false);
    setIsSubmitting(false);
    setFormData({
      name: "",
      address: "",
      city_id: "",
      community_id: "",
      state: "",
      zip: "",
    });
    setNewCommunityData({
      name: "",
      city_id: "",
      state: "",
      country: "USA",
      visibility: true,
    });
    setNewCityData({
      name: "",
      state: "Utah",
      country: "USA",
      visibility: true,
      image_url: "",
    });
  };

  const filteredCRCs = localCRCs.filter(
    (crc) =>
      crc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crc.city?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crc.community?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Manage Community Resource Centers
        </h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add CRC
          </button>
          <button
            onClick={() => setShowNewCommunityModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus size={20} />
            Add CRC to New Community
          </button>
          <button
            onClick={() => setShowNewCityModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Plus size={20} />
            Add CRC to New City
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search CRCs by name, city, community, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Community
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ZIP
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCRCs.map((crc) => (
              <tr
                key={crc.id}
                className={`hover:bg-gray-50 transition-colors ${
                  newItemIds.has(crc.id)
                    ? "bg-green-50 border-l-4 border-green-500"
                    : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    {crc.name}
                    {newItemIds.has(crc.id) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {crc.city?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {crc.community?.name || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {crc.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {crc.state}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {crc.zip}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(crc)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(crc)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCRCs.length === 0 && (
          <div className="text-center py-8 text-gray-500">No CRCs found</div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCRC ? "Edit CRC" : "Add New CRC"}</DialogTitle>
            <DialogDescription>
              {editingCRC
                ? "Update the Community Resource Center information."
                : "Create a new Community Resource Center."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <select
                  required
                  value={formData.city_id}
                  onChange={(e) => {
                    const selectedCity = cities.find(
                      (c) => c.id === e.target.value
                    );
                    setFormData({
                      ...formData,
                      city_id: e.target.value,
                      state: selectedCity?.state || "",
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community *
                </label>
                <select
                  required
                  value={formData.community_id}
                  onChange={(e) =>
                    setFormData({ ...formData, community_id: e.target.value })
                  }
                  disabled={!formData.city_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select a community</option>
                  {filteredCommunities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
                {!formData.city_id && (
                  <p className="text-xs text-gray-500 mt-1">
                    Select a city first
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{5}"
                  value={formData.zip}
                  onChange={(e) =>
                    setFormData({ ...formData, zip: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="12345"
                />
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingCRC ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingCRC ? "Update" : "Create"}</>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showNewCommunityModal}
        onOpenChange={setShowNewCommunityModal}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add CRC to New Community</DialogTitle>
            <DialogDescription>
              Create a new community and then add a CRC to it.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitWithNewCommunity}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Community Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Community Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCommunityData.name}
                      onChange={(e) =>
                        setNewCommunityData({
                          ...newCommunityData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <select
                      required
                      value={newCommunityData.city_id}
                      onChange={(e) => {
                        const selectedCity = cities.find(
                          (c) => c.id === e.target.value
                        );
                        setNewCommunityData({
                          ...newCommunityData,
                          city_id: e.target.value,
                          state: selectedCity?.state || "",
                          country: selectedCity?.country || "USA",
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}, {city.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="new-community-visibility-crc"
                      checked={newCommunityData.visibility}
                      onChange={(e) =>
                        setNewCommunityData({
                          ...newCommunityData,
                          visibility: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="new-community-visibility-crc"
                      className="text-sm font-medium text-gray-700"
                    >
                      Community Visible
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  CRC Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CRC Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{5}"
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData({ ...formData, zip: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="12345"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <button
                type="button"
                onClick={handleCloseNewCommunityModal}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Community & CRC"
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewCityModal} onOpenChange={setShowNewCityModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add CRC to New City</DialogTitle>
            <DialogDescription>
              Create a new city, community, and CRC all at once.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitWithNewCity}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  City Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCityData.name}
                      onChange={(e) =>
                        setNewCityData({ ...newCityData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value="Utah"
                      disabled
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value="USA"
                      disabled
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={newCityData.image_url}
                      onChange={(e) =>
                        setNewCityData({
                          ...newCityData,
                          image_url: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="new-city-visibility-crc"
                      checked={newCityData.visibility}
                      onChange={(e) =>
                        setNewCityData({
                          ...newCityData,
                          visibility: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="new-city-visibility-crc"
                      className="text-sm font-medium text-gray-700"
                    >
                      City Visible
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Community Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Community Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCommunityData.name}
                      onChange={(e) =>
                        setNewCommunityData({
                          ...newCommunityData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="new-community-visibility-city"
                      checked={newCommunityData.visibility}
                      onChange={(e) =>
                        setNewCommunityData({
                          ...newCommunityData,
                          visibility: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="new-community-visibility-city"
                      className="text-sm font-medium text-gray-700"
                    >
                      Community Visible
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  CRC Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CRC Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{5}"
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData({ ...formData, zip: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="12345"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <button
                type="button"
                onClick={handleCloseNewCityModal}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create City, Community & CRC"
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete CRC</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              Community Resource Center and all associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-semibold mb-2">
                Warning: This CRC will be permanently deleted
              </p>
              <p className="text-sm text-red-700">
                All data and records associated with this Community Resource
                Center will be removed.
              </p>
            </div>
            <p className="text-sm text-gray-700">
              Please type{" "}
              <span className="font-semibold">{deletingCRC?.name}</span> to
              confirm deletion.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type CRC name here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingCRC(null);
                setDeleteConfirmText("");
                setIsDeleting(false);
              }}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteConfirmText !== deletingCRC?.name || isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete CRC"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
