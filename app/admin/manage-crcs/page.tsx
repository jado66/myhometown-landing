"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CitiesTab } from "@/components/admin/cities-tab";
import { CommunitiesTab } from "@/components/admin/communities-tab";
import { CRCsTab } from "@/components/admin/crcs-tab";
import type { City, Community, CRC } from "@/types/admin";

export default function ManageAdminPage() {
  const [activeTab, setActiveTab] = useState("cities");
  const [cities, setCities] = useState<City[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [crcs, setCRCs] = useState<CRC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [citiesRes, communitiesRes, crcsRes] = await Promise.all([
        fetch("/api/admin/cities"),
        fetch("/api/admin/communities"),
        fetch("/api/admin/crcs"),
      ]);

      const [citiesData, communitiesData, crcsData] = await Promise.all([
        citiesRes.json(),
        communitiesRes.json(),
        crcsRes.json(),
      ]);

      setCities(citiesData);
      setCommunities(communitiesData);
      setCRCs(crcsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="crcs">CRCs</TabsTrigger>
        </TabsList>

        <TabsContent value="cities">
          <CitiesTab cities={cities} onRefresh={fetchAllData} />
        </TabsContent>

        <TabsContent value="communities">
          <CommunitiesTab
            communities={communities}
            cities={cities}
            onRefresh={fetchAllData}
          />
        </TabsContent>

        <TabsContent value="crcs">
          <CRCsTab
            crcs={crcs}
            cities={cities}
            communities={communities}
            onRefresh={fetchAllData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
