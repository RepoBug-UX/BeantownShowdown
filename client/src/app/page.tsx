import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Snowflake, Wallet, Search, Menu } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Snowflake className="h-6 w-6 text-gray-800" />
            <span className="text-xl font-semibold text-gray-800">Snowball</span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/projects" className="text-gray-600 hover:text-gray-800">
              Explore
            </Link>
            <Link href="/start" className="text-gray-600 hover:text-gray-800">
              Start a Project
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-800">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="hidden md:inline-flex">
              <Wallet className="mr-2 h-4 w-4" /> Connect
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Crowdfunding on Avalanche</h1>
          <p className="text-xl text-gray-600 mb-8">Fund innovative projects with blockchain simplicity</p>
          <div className="flex justify-center space-x-4">
            <Button size="lg">Launch Project</Button>
            <Button variant="outline" size="lg">
              <Search className="mr-2 h-5 w-5" /> Explore
            </Button>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((project) => (
              <Card key={project} className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Project {project}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-md mb-4"></div>
                  <Progress value={33} className="mb-2" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>$33,000 raised</span>
                    <span>30 days left</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Back this project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Categories</h2>
          <div className="flex flex-wrap gap-4">
            {["Technology", "Art", "Games", "Music", "Film", "Environment", "Social", "Innovation"].map((category) => (
              <Button key={category} variant="outline" className="bg-gray-50">
                {category}
              </Button>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Snowflake className="h-5 w-5 text-gray-600" />
              <span className="text-lg font-semibold text-gray-800">Snowball</span>
            </div>
            <nav className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link href="/terms" className="text-gray-600 hover:text-gray-800">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-800">
                Privacy
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-gray-800">
                FAQ
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-800">
                Contact
              </Link>
            </nav>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            © 2025 Snowball. All rights reserved. Powered by Avalanche Network.
          </div>
        </div>
      </footer>
    </div>
  )
}

