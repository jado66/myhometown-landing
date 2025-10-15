"use client";

import type React from "react";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
}

export function CommunitiesTab({
  communities,
  cities,
  onRefresh,
}: CommunitiesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(
    null
  );
  const [showNewCityModal, setShowNewCityModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city_id: "",
    state: "",
    country: "USA",
    visibility: true,
  });
  const [newCityData, setNewCityData] = useState({
    name: "",
    state: "",
    country: "USA",
    visibility: true,
    image_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingCommunity ? "PUT" : "POST";
      const url = editingCommunity
        ? `/api/admin/communities/${editingCommunity.id}`
        : "/api/admin/communities";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save community");

      await onRefresh();
      handleCloseModal();
      toast.success(
        editingCommunity
          ? "Community updated successfully!"
          : "Community created successfully!"
      );
    } catch (error) {
      console.error("Error saving community:", error);
      toast.error("Failed to save community");
    }
  };

  const handleSubmitWithNewCity = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // First create the city
      const cityResponse = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCityData),
      });

      if (!cityResponse.ok) throw new Error("Failed to create city");

      const newCity = await cityResponse.json();

      // Then create the community with the new city
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

      await onRefresh();
      handleCloseNewCityModal();
      toast.success("City and community created successfully!");
    } catch (error) {
      console.error("Error creating city and community:", error);
      toast.error("Failed to create city and community");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this community?")) return;

    try {
      const response = await fetch(`/api/admin/communities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete community");

      await onRefresh();
      toast.success("Community deleted successfully!");
    } catch (error) {
      console.error("Error deleting community:", error);
      toast.error("Failed to delete community");
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
    setFormData({
      name: "",
      city_id: "",
      state: "",
      country: "USA",
      visibility: true,
    });
    setNewCityData({
      name: "",
      state: "",
      country: "USA",
      visibility: true,
      image_url: "",
    });
  };

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.city?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <tr key={community.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {community.name}
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
                    onClick={() => handleDelete(community.id)}
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

      {/* Regular Add Community Modal */}
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCommunity ? "Update" : "Create"}
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
              {/* City Information Section */}
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
                      value={newCityData.state}
                      onChange={(e) =>
                        setNewCityData({
                          ...newCityData,
                          state: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCityData.country}
                      onChange={(e) =>
                        setNewCityData({
                          ...newCityData,
                          country: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

              {/* Community Information Section */}
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create City & Community
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
