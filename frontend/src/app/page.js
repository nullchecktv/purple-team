'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function Home() {
  const [showImageUpload, setShowImageUpload] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🥚</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Chicken Vision</h1>
                <p className="text-xs text-gray-500">AI-Powered Poultry Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                Console
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="text-white text-3xl">🐣</span>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Chicken Vision
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              AI-powered chicken surveillance meets blockchain egg certificates!
              <br />
              Because apparently even chickens need crypto now. 🤖🐔⛓️
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <a 
                href="/dashboard"
                className="px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Launch Console
              </a>
              <button
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Upload Egg Image
              </button>
            </div>

            {showImageUpload && (
              <div className="mt-12 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-gray-900">
                      AI-Powered Egg Analysis
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Upload an image for comprehensive analysis using AWS Bedrock
                    </p>
                  </div>
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ImageUpload />
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 border-t border-gray-200">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built on AWS Infrastructure
            </h2>
            <p className="text-lg text-gray-600">
              Leveraging enterprise-grade AWS services for reliability and scale
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '👁️',
                title: 'Computer Vision',
                description: 'Advanced image recognition with AWS Bedrock for egg quality assessment and visual analysis',
                service: 'Amazon Bedrock'
              },
              {
                icon: '⛓️',
                title: 'Blockchain Certification',
                description: 'Immutable record keeping using Amazon Managed Blockchain Access on Ethereum',
                service: 'AMB Access'
              },
              {
                icon: '📊',
                title: 'Real-time Monitoring',
                description: 'Live environmental tracking with DynamoDB streams and Lambda functions',
                service: 'DynamoDB + Lambda'
              },
              {
                icon: '🔄',
                title: 'Automated Rotation',
                description: 'Precision servo control system with IoT integration and monitoring',
                service: 'AWS IoT Core'
              },
              {
                icon: '📱',
                title: 'Vision Dashboard',
                description: 'Real-time visual monitoring interface deployed on CloudFront with S3 hosting',
                service: 'CloudFront + S3'
              },
              {
                icon: '🔒',
                title: 'Enterprise Security',
                description: 'IAM-based access control with encryption at rest and in transit',
                service: 'AWS IAM + KMS'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {feature.service}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center border-t border-gray-200">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Launch the management console to begin monitoring your chicken hatching operations.
            </p>
            <a 
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Launch Console
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">🥚</span>
              </div>
              <span className="text-sm text-gray-600">Chicken Vision - Powered by AWS</span>
            </div>
            <div className="text-sm text-gray-500">
              Built for the Magnificent Impracticability category
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}