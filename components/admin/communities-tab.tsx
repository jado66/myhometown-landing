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
import type { City, Community } from "@/types/admin";
import { toast } from "sonner";

interface CommunitiesTabProps {
  communities: Community[];
  cities: City[];
  onRefresh: () => void;
  onShowToast: (message: string, type: "success" | "error") => void;
}

export function CommunitiesTab({
  communities,
  cities,
  onRefresh,
  onShowToast,
}: CommunitiesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(
    null
  );
  const [showNewCityModal, setShowNewCityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCommunity, setDeletingCommunity] = useState<Community | null>(
    null
  );
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [localCommunities, setLocalCommunities] =
    useState<Community[]>(communities);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
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
    setLocalCommunities(communities);
  }, [communities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingCommunity ? "PUT" : "POST";
      const url = editingCommunity
        ? `/api/admin/communities/${editingCommunity.id}`
        : "/api/admin/communities";

      if (editingCommunity) {
        const selectedCity = cities.find((c) => c.id === formData.city_id);
        setLocalCommunities((prev) =>
          prev.map((community) =>
            community.id === editingCommunity.id
              ? { ...community, ...formData, city: selectedCity }
              : community
          )
        );
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save community");

      const savedCommunity = await response.json();

      if (!editingCommunity) {
        const selectedCity = cities.find((c) => c.id === formData.city_id);
        setLocalCommunities((prev) => [
          ...prev,
          { ...savedCommunity, city: selectedCity },
        ]);
        setNewItemIds((prev) => new Set(prev).add(savedCommunity.id));
      } else {
        setLocalCommunities((prev) =>
          prev.map((community) =>
            community.id === savedCommunity.id ? savedCommunity : community
          )
        );
      }

      onShowToast(
        editingCommunity
          ? "Community updated successfully!"
          : "Community created successfully!",
        "success"
      );
      handleCloseModal();

      onRefresh();
    } catch (error) {
      console.error("Error saving community:", error);
      onShowToast("Failed to save community", "error");
      setLocalCommunities(communities);
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
          name: formData.name,
          city_id: newCity.id,
          state: newCityData.state,
          country: newCityData.country,
          visibility: formData.visibility,
        }),
      });

      if (!communityResponse.ok) throw new Error("Failed to create community");

      const newCommunity = await communityResponse.json();

      setLocalCommunities((prev) => [
        ...prev,
        { ...newCommunity, city: newCity },
      ]);

      setNewItemIds((prev) => new Set(prev).add(newCommunity.id));

      onShowToast("City and community created successfully!", "success");
      handleCloseNewCityModal();

      onRefresh();
    } catch (error) {
      console.error("Error creating city and community:", error);
      onShowToast("Failed to create city and community", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (community: Community) => {
    setDeletingCommunity(community);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCommunity || deleteConfirmText !== deletingCommunity.name) {
      onShowToast("Community name does not match", "error");
      return;
    }

    setIsDeleting(true);

    try {
      setLocalCommunities((prev) =>
        prev.filter((community) => community.id !== deletingCommunity.id)
      );

      const response = await fetch(
        `/api/admin/communities/${deletingCommunity.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete community");

      onShowToast("Community deleted successfully!", "success");

      // Small delay before closing modal to ensure toast renders
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeletingCommunity(null);
        setDeleteConfirmText("");
      }, 100);

      onRefresh();
    } catch (error) {
      console.error("Error deleting community:", error);
      onShowToast("Failed to delete community", "error");
      setLocalCommunities(communities);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (community: Community) => {
    setEditingCommunity(community);
    setFormData({
      name: community.name,
      city_id: community.city_id,
      state: community.state,
      country: community.country,
      visibility: community.visibility,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCommunity(null);
    setIsSubmitting(false);
    setFormData({
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

  const filteredCommunities = [...localCommunities]
    .filter((community) => {
      const term = searchTerm.toLowerCase();
      return (
        community.name.toLowerCase().includes(term) ||
        community.city?.name.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const cityA = a.city?.name?.toLowerCase() || "";
      const cityB = b.city?.name?.toLowerCase() || "";
      if (cityA && cityB && cityA !== cityB) {
        return cityA.localeCompare(cityB);
      }
      // Fallback: sort by community name if same / missing city
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Communities</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Community
          </button>
          <button
            onClick={() => setShowNewCityModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus size={20} />
            Add Community to New City
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
            placeholder="Search communities by name or city..."
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
                State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCommunities.map((community) => (
              <tr
                key={community.id}
                className={`hover:bg-gray-50 transition-colors ${
                  newItemIds.has(community.id)
                    ? "bg-green-50 border-l-4 border-green-500"
                    : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    {community.name}
                    {newItemIds.has(community.id) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {community.city?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {community.state}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {community.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      community.visibility
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {community.visibility ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(community)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(community)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCommunities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No communities found
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCommunity ? "Edit Community" : "Add New Community"}
            </DialogTitle>
            <DialogDescription>
              {editingCommunity
                ? "Update the community information."
                : "Create a new community."}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="community-visibility"
                  checked={formData.visibility}
                  onChange={(e) =>
                    setFormData({ ...formData, visibility: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="community-visibility"
                  className="text-sm font-medium text-gray-700"
                >
                  Visible
                </label>
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
                    {editingCommunity ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingCommunity ? "Update" : "Create"}</>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewCityModal} onOpenChange={setShowNewCityModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Community to New City</DialogTitle>
            <DialogDescription>
              Create a new city and then add a community to it.
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
                      id="new-city-visibility"
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
                      htmlFor="new-city-visibility"
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
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="new-community-visibility"
                      checked={formData.visibility}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visibility: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="new-community-visibility"
                      className="text-sm font-medium text-gray-700"
                    >
                      Community Visible
                    </label>
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create City & Community"
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Community</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              community and all associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-semibold mb-2">
                Warning: The following will also be deleted:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>All Community Resource Centers in this community</li>
                <li>All associated data and records</li>
              </ul>
            </div>
            <p className="text-sm text-gray-700">
              Please type{" "}
              <span className="font-semibold">{deletingCommunity?.name}</span>{" "}
              to confirm deletion.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type community name here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingCommunity(null);
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
              disabled={
                deleteConfirmText !== deletingCommunity?.name || isDeleting
              }
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Community"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
