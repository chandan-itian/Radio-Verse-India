import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStationById, getStations } from "@/lib/stations-repository";
import { StationDetailClient } from "./station-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const station = await getStationById(id);

  if (!station) {
    return {
      title: "Station Not Found — RadioVerse India",
    };
  }

  const title = `${station.name} Live Radio — RadioVerse India`;
  const description =
    station.description ||
    `Listen to ${station.name} broadcast live on RadioVerse India. Authentic ${station.language} radio streaming.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: station.logoUrl ? [{ url: station.logoUrl }] : [],
      url: `https://radioverse.in/stations/${station.slug || station.id}`,
      type: "music.radio_station",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: station.logoUrl ? [station.logoUrl] : [],
    },
  };
}

export default async function StationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const station = await getStationById(id);

  if (!station) {
    notFound();
  }

  // Get related stations in the same language
  const { stations: related } = await getStations({
    language: station.language,
    limit: 6,
  });

  const filteredRelated = related.filter((s) => s.id !== station.id);

  return <StationDetailClient station={station} relatedStations={filteredRelated} />;
}
