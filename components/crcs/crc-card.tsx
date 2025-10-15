"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";
import type { CRC, CRCWithDistance } from "@/types/crc";

interface CRCCardProps {
  crc: CRC | CRCWithDistance;
  onSelect?: (crc: CRC) => void;
  showSelectButton?: boolean;
}

export function CRCCard({
  crc,
  onSelect,
  showSelectButton = false,
}: CRCCardProps) {
  const hasDistance = "distance" in crc;

  return (
    <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl leading-tight">{crc.name}</CardTitle>
          {hasDistance && (
            <div className="flex items-center gap-1 text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md whitespace-nowrap">
              <Navigation className="h-3 w-3" />
              {crc.distance} mi
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <div>{crc.address}</div>
              <div className="text-muted-foreground">
                {crc.city?.name || ""}, {crc.state || crc.city?.state || ""}{" "}
                {crc.zip}
              </div>
            </div>
          </div>

          {crc.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a
                href={`tel:${crc.phone}`}
                className="hover:text-primary transition-colors"
              >
                {crc.phone}
              </a>
            </div>
          )}
        </div>

        {showSelectButton && onSelect && (
          <Button
            onClick={() => onSelect(crc)}
            className="w-full mt-4 text-white"
            size="lg"
          >
            View Classes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
