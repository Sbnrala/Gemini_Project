
import React from 'react';
import { WallPost } from '../types';

const MOCK_POSTS: WallPost[] = [
  {
    id: 'p1',
    authorName: 'Marcus Thorne',
    authorAvatar: 'https://picsum.photos/seed/marcus/200/200',
    content: 'Just finished the wiring for a 4,000sqft smart home. Remember: Always label your junction boxes, it saves hours during troubleshooting! ⚡️',
    image: 'https://picsum.photos/seed/elec/800/600',
    likes: 24,
    timestamp: '2h ago',
    tags: ['#electrical', '#pro-tip', '#smarthome']
  },
  {
    id: 'p2',
    authorName: 'Sarah Chen',
    authorAvatar: 'https://picsum.photos/seed/sarah/200/200',
    content: 'New hack for retaining walls: Using recycled glass aggregates for drainage. Better for the environment and looks stunning with backlighting. 🌿',
    image: 'https://picsum.photos/seed/garden/800/600',
    likes: 56,
    timestamp: '5h ago',
    tags: ['#landscaping', '#sustainability']
  }
];

export const BuildersWall: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex gap-4">
          <img src="https://picsum.photos/seed/me/100/100" className="w-12 h-12 rounded-2xl" alt="Me" />
          <div className="flex-1">
            <textarea 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Share a build achievement or a hack..."
              rows={2}
            />
            <div className="flex justify-between items-center mt-4">
              <button className="text-indigo-600 font-bold text-xs flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Attach Photo
              </button>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">Post</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {MOCK_POSTS.map(post => (
          <div key={post.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <img src={post.authorAvatar} className="w-10 h-10 rounded-xl" alt={post.authorName} />
                <div>
                  <h4 className="font-bold text-slate-800">{post.authorName}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{post.timestamp}</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm mb-6">{post.content}</p>
              {post.image && (
                <div className="rounded-3xl overflow-hidden border border-slate-100 mb-6">
                  <img src={post.image} className="w-full h-auto" alt="Post Build" />
                </div>
              )}
              <div className="flex gap-2 mb-6">
                {post.tags.map(tag => (
                  <span key={tag} className="text-indigo-600 font-bold text-[10px]">{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  <span className="text-xs font-bold">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <span className="text-xs font-bold">Comments</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
