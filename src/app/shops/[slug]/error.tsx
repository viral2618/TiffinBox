"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Store } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function ShopError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full p-8 bg-card shadow-lg rounded-xl border border-red-200"
      >
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          
          <p className="text-muted-foreground mb-8">
            We couldn't load the shop details. Please try again or go back to the shops page.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button 
              onClick={reset} 
              variant="default"
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              asChild
            >
              <Link href="/shops">
                <Store className="h-4 w-4" />
                Back to Shops
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}