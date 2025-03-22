"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            About Snowball
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Snowball is a platform for the Beantown Showdown hackathon,
            connecting projects with developers, designers, and investors across
            Boston.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-4">
                We're building a decentralized platform that empowers innovators
                to transform their ideas into reality. By leveraging blockchain
                technology, we create a transparent ecosystem where creative
                projects can find the resources and support they need to thrive.
              </p>
              <p className="text-gray-600">
                Our goal is to foster a vibrant community of creators, backers,
                and enthusiasts who are passionate about building the future of
                tech in Boston and beyond.
              </p>
            </div>
            <div className="bg-blue-100 rounded-lg p-8 flex items-center justify-center">
              <div className="max-w-md">
                <div className="text-5xl font-bold text-blue-600 mb-4">
                  Boston's First
                </div>
                <div className="text-2xl text-gray-700">
                  Web3 Project Launchpad
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
            Why Choose Snowball
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Transparent Funding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our blockchain-based platform ensures complete transparency in
                  how funds are raised and distributed to projects.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Community Governance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Token holders can participate in platform decisions, creating
                  a truly decentralized ecosystem.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Talent Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with skilled developers, designers, and other
                  professionals to build your dream team.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
            Our Team
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((member) => (
              <div key={member} className="text-center">
                <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="font-bold text-lg mb-1">Team Member {member}</h3>
                <p className="text-gray-600 mb-3">Co-Founder</p>
                <div className="flex justify-center space-x-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Github className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Join the Snowball Community
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a creator, developer, or investor, there's a place
            for you in our ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/platform/explore">Explore Projects</Link>
            </Button>
            <Button className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600">
              <Link href="/platform/create">Start a Project</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
