import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import SobreMiSection from '@/components/sections/SobreMiSection'
import ServiciosSection from '@/components/sections/ServiciosSection'
import PortafolioSection from '@/components/sections/PortafolioSection'
import FAQSection from '@/components/sections/FAQSection'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SobreMiSection />
        <ServiciosSection />
        <PortafolioSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}
