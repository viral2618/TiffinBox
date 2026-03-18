"use client";

import { Metadata } from 'next';
import { DonationVideoSection } from '@/components/cards/donation-video-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Leaf, Globe } from 'lucide-react';

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Video */}
      <DonationVideoSection 
        autoPlay={true}
        className="bg-gradient-to-b from-blue-50 to-white"
        title="Support Our Mission"
        description="WhenFresh connects communities with fresh, local food. Your donation helps us expand access to healthy options and support local farmers and businesses."
      />

      {/* Impact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Impact</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every donation helps us build stronger, healthier communities through better food access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect people with local food sources and build stronger neighborhoods.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Sustainability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Promote sustainable food practices and reduce food waste.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Improve access to fresh, nutritious food for everyone.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Expand our platform to reach more communities worldwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Donation Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Support Level</h2>
            <p className="text-lg text-muted-foreground">
              Every contribution makes a difference, no matter the size.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">$25</CardTitle>
                <p className="text-muted-foreground">Community Supporter</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>• Help connect 10 families with local food</li>
                  <li>• Support platform maintenance</li>
                  <li>• Contribute to community outreach</li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => window.open('https://donate.whenfresh.com?amount=25', '_blank')}
                >
                  Donate $25
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-blue-500">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">$50</CardTitle>
                <p className="text-muted-foreground">Growth Advocate</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>• Connect 25 families with fresh food</li>
                  <li>• Support new feature development</li>
                  <li>• Fund community partnerships</li>
                  <li>• Help expand to new areas</li>
                </ul>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600" 
                  onClick={() => window.open('https://donate.whenfresh.com?amount=50', '_blank')}
                >
                  Donate $50
                </Button>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">$100</CardTitle>
                <p className="text-muted-foreground">Mission Champion</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>• Impact 50+ families directly</li>
                  <li>• Fund major platform improvements</li>
                  <li>• Support farmer partnerships</li>
                  <li>• Enable community events</li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => window.open('https://donate.whenfresh.com?amount=100', '_blank')}
                >
                  Donate $100
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.open('https://donate.whenfresh.com', '_blank')}
            >
              Custom Amount
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}