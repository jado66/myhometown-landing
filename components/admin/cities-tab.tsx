"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { City } from "@/types/admin";
import { toast } from "sonner";

interface CitiesTabProps {
  cities: City[];
  onRefresh: () => void;
  onShowToast: (message: string, type: "success" | "error") => void;
}

export function CitiesTab({ cities, onRefresh, onShowToast }: CitiesTabProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCity, setDeletingCity] = useState<City | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [localCities, setLocalCities] = useState<City[]>(cities);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    state: "Utah",
    country: "USA",
    visibility: true,
    image_url: "",
  });

  useEffect(() => {
    setLocalCities(cities);
  }, [cities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingCity ? "PUT" : "POST";
      const url = editingCity
        ? `/api/admin/cities/${editingCity.id}`
        : "/api/admin/cities";

      if (editingCity) {
        setLocalCities((prev) =>
          prev.map((city) =>
            city.id === editingCity.id ? { ...city, ...formData } : city
          )
        );
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save city");

      const savedCity = await response.json();

      if (!editingCity) {
        setLocalCities((prev) => [...prev, savedCity]);
        setNewItemIds((prev) => new Set(prev).add(savedCity.id));
      } else {
        setLocalCities((prev) =>
          prev.map((city) => (city.id === savedCity.id ? savedCity : city))
        );
      }

      onShowToast(
        editingCity
          ? "City updated successfully!"
          : "City created successfully!",
        "success"
      );

      // Refresh the router to update cached city data across the app
      router.refresh();

      // Small delay before closing modal to ensure toast renders
      setTimeout(() => {
        handleCloseModal();
      }, 100);

      onRefresh();
    } catch (error) {
      console.error("Error saving city:", error);
      onShowToast("Failed to save city", "error");
      setLocalCities(cities);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (city: City) => {
    setDeletingCity(city);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCity || deleteConfirmText !== deletingCity.name) {
      onShowToast("City name does not match", "error");
      return;
    }

    setIsDeleting(true);

    try {
      setLocalCities((prev) =>
        prev.filter((city) => city.id !== deletingCity.id)
      );

      const response = await fetch(`/api/admin/cities/${deletingCity.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete city");

      onShowToast("City deleted successfully!", "success");

      // Refresh the router to update cached city data across the app
      router.refresh();

      // Small delay before closing modal to ensure toast renders
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeletingCity(null);
        setDeleteConfirmText("");
      }, 100);

      onRefresh();
    } catch (error) {
      console.error("Error deleting city:", error);
      onShowToast("Failed to delete city", "error");
      setLocalCities(cities);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      state: city.state,
      country: city.country,
      visibility: city.visibility,
      image_url: city.image_url || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCity(null);
    setIsSubmitting(false);
    setFormData({
      name: "",
      state: "",
      country: "USA",
      visibility: true,
      image_url: "",
    });
  };

  const filteredCities = localCities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Cities</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add City
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
            placeholder="Search cities by name or state..."
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
            {filteredCities.map((city) => (
              <tr
                key={city.id}
                className={`hover:bg-gray-50 transition-colors ${
                  newItemIds.has(city.id)
                    ? "bg-green-50 border-l-4 border-green-500"
                    : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    {city.name}
                    {newItemIds.has(city.id) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {city.state}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {city.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      city.visibility
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {city.visibility ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(city)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(city)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCities.length === 0 && (
          <div className="text-center py-8 text-gray-500">No cities found</div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCity ? "Edit City" : "Add New City"}
            </DialogTitle>
            <DialogDescription>
              {editingCity
                ? "Update the city information."
                : "Create a new city."}
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
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visibility"
                  checked={formData.visibility}
                  onChange={(e) =>
                    setFormData({ ...formData, visibility: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="visibility"
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
                    {editingCity ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingCity ? "Update" : "Create"}</>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete City</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              city and all associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-semibold mb-2">
                Warning: The following will also be deleted:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>All communities in this city</li>
                <li>All Community Resource Centers in those communities</li>
                <li>All associated data and records</li>
              </ul>
            </div>
            <p className="text-sm text-gray-700">
              Please type{" "}
              <span className="font-semibold">{deletingCity?.name}</span> to
              confirm deletion.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type city name here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingCity(null);
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
              disabled={deleteConfirmText !== deletingCity?.name || isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete City"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
