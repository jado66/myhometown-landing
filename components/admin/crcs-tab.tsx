"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { City, Community, CRC } from "@/types/admin";

interface CRCsTabProps {
  crcs: CRC[];
  cities: City[];
  communities: Community[];
  onRefresh: () => void;
}

export function CRCsTab({
  crcs,
  cities,
  communities,
  onRefresh,
}: CRCsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCRC, setEditingCRC] = useState<CRC | null>(null);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(
    []
  );
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city_id: "",
    community_id: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    if (formData.city_id) {
      const filtered = communities.filter(
        (c) => c.city_id === formData.city_id
      );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingCRC ? "PUT" : "POST";
      const url = editingCRC
        ? `/api/admin/crcs/${editingCRC.id}`
        : "/api/admin/crcs";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save CRC");

      await onRefresh();
      handleCloseModal();
      alert(
        editingCRC ? "CRC updated successfully!" : "CRC created successfully!"
      );
    } catch (error) {
      console.error("Error saving CRC:", error);
      alert("Failed to save CRC");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this CRC?")) return;

    try {
      const response = await fetch(`/api/admin/crcs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete CRC");

      await onRefresh();
      alert("CRC deleted successfully!");
    } catch (error) {
      console.error("Error deleting CRC:", error);
      alert("Failed to delete CRC");
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
    setFormData({
      name: "",
      address: "",
      city_id: "",
      community_id: "",
      state: "",
      zip: "",
    });
  };

  const filteredCRCs = crcs.filter(
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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add CRC
        </button>
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
              <tr key={crc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {crc.name}
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
                    onClick={() => handleDelete(crc.id)}
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCRC ? "Update" : "Create"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
