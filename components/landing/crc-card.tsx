"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";
import { CRC, CRCWithDistance } from "@/types/crc";
import { getCRCClassesUrl } from "@/lib/crcs";
import Link from "next/link";

interface CRCCardProps {
  crc: CRC | CRCWithDistance;
}

function hasDistance(crc: CRC | CRCWithDistance): crc is CRCWithDistance {
  return "distance" in crc;
}

export function CRCCard({ crc }: CRCCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-xl transition-all duration-300 flex flex-col h-full border-2 hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg text-primary leading-tight flex-1">
              {crc.name}
            </CardTitle>
            {hasDistance(crc) && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                {crc.distance.toFixed(1)} mi
              </span>
            )}
          </div>
          <CardDescription className="text-base font-medium">
            {crc.city?.name || ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 flex-1 flex flex-col pt-0">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-600">{crc.address}</p>
          </div>
          {crc.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">{crc.phone}</p>
            </div>
          )}
          {crc.classes && crc.classes.length > 0 && (
            <div className="pt-2 flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Featured Classes:
              </p>
              <div className="flex flex-wrap gap-2">
                {crc.classes.map((cls) => (
                  <span
                    key={cls}
                    className="inline-block px-2.5 py-1 text-xs font-medium bg-stone-100 text-gray-700 rounded-full"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}
          <Button asChild className="w-full mt-4 bg-primary text-white hover:bg-primary/90">
            <Link href={getCRCClassesUrl(crc)}>
              View Schedule & Sign Up
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
