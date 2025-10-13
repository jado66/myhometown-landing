import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "A Cooperative Partnership",
    description:
      "My Hometown brings together local governments, faith-based organizations, businesses, non-profits, and residents in a unified effort to strengthen our communities. Through collaborative partnerships, we coordinate resources, volunteers, and expertise to create lasting positive change in neighborhoods across Utah.",
    image:
      "https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/private-foundation-vs-public-charity.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRmACAABXRUJQVlA4WAoAAAAIAAAAEwAACAAAVlA4IGQBAABQCgCdASoUAAkAPh0Kg0CDAIAAYDiegAnTKEcDegfirLAP4BhFf8zygD0AP1A9Ir2HfKAeIJ4t+I34wZ6TcgUar+Kuur/pvGV+of/I/7v+Zwrhr/ZP4puFZkZAAP75ZAHuZfQ+poTzp/RbbzA0p++A0esfDfPvpqfiyXg5jeDFwP7f95DRLoIYLZD229eR+HaVdCrWbb/pr9ZtFm/Cf/IE819vsz/+FVj9b/ZViJhyndH71/5+P9uEbP2ZJqsxwzi//66/dZDLEpS+5/Df4JPwimnNyAtvq/fiFVXGP7nhbmKk+2/2LjsBThwfRE9TKx0l3u3XXh+3J/qZENBB662D78CrrtCsNIt6Z/O1UBvjz/8i1+9HScr/5idzdJS8zCD+PwGf3P4J1+Q/68Yy59XE/igr4l5k6jm3G/yjiev/jHpAbfwZFMXL+fa+x1N6orwTEsbbU7hz/6Ufb8fVHH/2VEAAAEVYSUbWAAAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAADEBAgAQAAAAZgAAAGmHBAABAAAAdgAAAAAAAABgAAAAAQAAAGAAAAABAAAAUGFpbnQuTkVUIDUuMS43AAUAAJAHAAQAAAAwMjMwAaADAAEAAAABAAAAAqAEAAEAAAAUAAAAA6AEAAEAAAAJAAAABaAEAAEAAAC4AAAAAAAAAAIAAQACAAQAAABSOTgAAgAHAAQAAAAwMTAwAAAAAA==",
    color: "bg-[#8b5cf6]",
  },
  {
    title: "How We Make a Difference",
    description:
      "From April to October, we organize volunteer-driven projects including neighborhood clean-ups, landscape renewal, home repairs, and community beautification. Our Community Resource Centers offer classes and support services, while our online platform makes it easy to find projects, sign up to volunteer, and connect with neighbors. Every project strengthens bonds and improves quality of life.",
    image:
      "https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/Photos+1/iStock-1164938630.jpg",
    blurDataURL:
      "data:image/webp;base64,UklGRpoCAABXRUJQVlA4WAoAAAAIAAAAEwAADAAAVlA4IJ4BAACwCgCdASoUAA0APh0Kg0CDAIAAYDiewAnTKEcDeQbwEYA7DP9QMsA57H2Gf2N9Hd4yvoH5AfkBpGMZm73GMl1In9d+2b3wsVD1Gf5F/mfzQGkXwcJfbSqm4kydf5CAAP226Ygw6YoKqRow25j8K+gkdGoe0zxra+UzpGmExx9yO4+wgOC6XX+v4HMbHfu3YUJdpr7D95aB1YUHrK1eRve3J/MnFevVP/+zT5X0oQfmcvIC6UibXV8xTtSjsC07rhmU5PbFh1uatxFZu7b392XXv0OLaOw57rMfz84Gf/XQcel7YFnq0qg1jV1N+X/+tGPRMuUm3mj+H7KpF4dV6HOIc8cajU4aQWcf6ZXbw0oPb6Yk4Jh5yy7q9DyHvVK0d7+Bf0I5s9LQydXY57SWoQla/qC3uU8dvobpVYedS9wT9Z3ykSzz/4wf6PCcMLmfu37Jhp/5l0YYiF7NGZy81fcy66nywYySfyZKt8//Zw9TnsXGfuc/+cv3t/CDKMwxaRoez63HAOdCD/jBIb24c3r0suIA0Lf/zuuuP3YAAABFWElG1gAAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAAxAQIAEAAAAGYAAABphwQAAQAAAHYAAAAAAAAAYAAAAAEAAABgAAAAAQAAAFBhaW50Lk5FVCA1LjEuNwAFAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAKgBAABAAAAFAAAAAOgBAABAAAADQAAAAWgBAABAAAAuAAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAAA=",
    color: "bg-[#318d43]",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4  lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why My Hometown Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our approach combines community partnerships with hands-on service
            to create lasting impact
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-90">
                <Image
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  fill
                  placeholder="blur"
                  blurDataURL={feature.blurDataURL || undefined}
                  className="object-cover rounded-t-lg"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
