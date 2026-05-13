import { HomeHero } from "@/components/home-hero"
import { getSiteConfig } from "@/lib/site-data"

export default async function HomePage() {
  const { heroImageUrl, logoUrl, mainText, subText, siteName } = getSiteConfig()

  return (
    <HomeHero 
      heroImageUrl={heroImageUrl}
      logoUrl={logoUrl}
      mainText={mainText}
      subText={subText}
      siteName={siteName}
    />
  )
}
