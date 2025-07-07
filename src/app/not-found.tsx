import { Layout } from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-medium text-gray-800">404 - Not Found</h1>
          </div>
          
          <div className="p-8">
            <div className="flex items-center gap-8">
              {/* Left side - 404 Image */}
              <div className="flex-shrink-0">
                <Image
                  src="/404.png"
                  alt="404 Error"
                  width={200}
                  height={200}
                  className="object-contain"
                  priority
                />
              </div>
              
              {/* Right side - Text content */}
              <div className="flex-1">
                <div className="text-gray-700 leading-relaxed">
                  <p className="mb-4">
                    There&apos;s nothing here. You may have followed a link to an item that was deleted.
                  </p>
                  <p>
                    Check with{' '}
                    <Link
                      href="https://vercel.slack.com/archives/C094FVBAVLH"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      #coord-gtmfeedback-app
                    </Link>
                    {' '}on Slack if you think this is in error!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 