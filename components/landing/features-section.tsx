import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "A Cooperative Partnership",
    description:
      "My Hometown brings together local governments, faith-based organizations, businesses, non-profits, and residents in a unified effort to strengthen our communities. Through collaborative partnerships, we coordinate resources, volunteers, and expertise to create lasting positive change in neighborhoods across Utah.",
    image:
      "https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/private-foundation-vs-public-charity.webp",
    color: "bg-[#8b5cf6]",
  },
  {
    title: "How We Make a Difference",
    description:
      "From April to October, we organize volunteer-driven projects including neighborhood clean-ups, landscape renewal, home repairs, and community beautification. Our Community Resource Centers offer classes and support services, while our online platform makes it easy to find projects, sign up to volunteer, and connect with neighbors. Every project strengthens bonds and improves quality of life.",
    image:
      "https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/Photos+1/iStock-1164938630.jpg",
    color: "bg-[#318d43]",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
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
