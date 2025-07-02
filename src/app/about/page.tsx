import { Layout } from '@/components/layout/Layout';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <Layout>
      <div className="space-y-6 text-white mx-auto max-w-[75vw]">
        <div className="border-b pb-4">
          <h1 className="text-5xl font-semibold pb-5">About ▲Vercel/Feedback</h1>
          <h3>Questions? Please visit <Link href="https://vercel.slack.com/archives/C094FVBAVLH" className="text-green-400 font-bold hover:underline">#project-gtmfeedback-app</Link> on Slack.</h3>
        </div>
        
        <div className="prose prose-neutral dark:prose-invert bg-white text-black p-4 rounded-lg min-w-72 max-w-300">
          <p>
            {`Welcome! Thanks for visiting ▲Vercel/Feedback. This is a brief explainer of what this tool sets out to do, and also, vitally, what it's `}<em>not</em>{` for. This tool will evolve over time and we're very open to feedback, but we think it'll be useful to establish the relatively-tight intended scope of this tool.`}
          </p>

          <div className="grid grid-cols-2 gap-x-4 outline rounded-md p-2 border-2 divide-x divide-slate-300 mt-5 mb-8">
            <div className="text-center p-1 font-bold">🟢 Goals & Scope</div>
            <div className="text-center p-1 font-bold">{`❌ Anti-Goals / What this isn't`}</div>
            <div>
              <ul className="px-3 py-1 space-y-2 ">
                <li>{`▴ ~Zero-friction, revenue-aligned, curated logging of what GTM is hearing from customers & prospects.`}</li>
                <li>{`▴ Realtime source of truth for customer demand, supporting both product research and GTM escalations.`}</li>
                <li>{`▴ Reports and views (e.g. views by product area and account) to answer the most important, common questions about this data.`}</li>
                <li>{`▴ Outgoing pushes of every entry to product area '#firehose' Slack channels.`}</li>
              </ul>
            </div>
            <div>
            <ul className="px-3 py-1 space-y-2">
                <li className="p-1">{`▴ This is NOT a replacement for roadmap docs, the launch calendar, or any canonical 'state' of product development.`}</li>
                <li>{`▴ This does NOT imply any 'tasks' or responsibilities for Product. We hope this is seen as a useful data source, but there's no expectation that Product is coming in here regularly to respond or comment on items. The primary onus is on GTM to use this data to 'push' escalated requests to Product, although we'd be thrilled if Product organically finds itself 'pulling' insights proactively as well.`}</li>
                <li>{`▴ We're NOT boiling the ocean in terms of possible reports or cuts of the data. We're prioritizing a small set of key reports which make it easy to see where demand is, but we're not attempting to cover everything.`}</li>
              </ul>
            </div>
          </div>

          
        </div>
      </div>
    </Layout>
  );
} 