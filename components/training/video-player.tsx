"use client";

import { useRef, useState } from "react";

interface VideoPlayerProps {
  url: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget;
    const error = videoElement.error;

    let errorMessage = "Unable to play this video.";

    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage = "Video playback was aborted.";
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage = "A network error occurred while loading the video.";
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage =
            "The video format is not supported or the file is corrupted.";
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage =
            "This video format (.wmv) is not supported by your browser. Please convert to MP4 or use a different browser.";
          break;
      }
    }

    setError(errorMessage);
    setIsLoading(false);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Video Display */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-destructive/20 to-destructive/10 p-6">
            <div className="text-center space-y-4 max-w-md">
              <div className="text-destructive font-semibold">
                Video Playback Error
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <details className="text-xs text-muted-foreground text-left">
                <summary className="cursor-pointer hover:text-foreground">
                  Video URL
                </summary>
                <p className="mt-2 break-all">{url}</p>
              </details>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="text-white">Loading video...</div>
              </div>
            )}
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              controls
              preload="metadata"
              onError={handleError}
              onLoadStart={handleLoadStart}
              onCanPlay={handleCanPlay}
            >
              <source src={url} />
              Your browser does not support the video tag.
            </video>
          </>
        )}
      </div>
    </div>
  );
}
