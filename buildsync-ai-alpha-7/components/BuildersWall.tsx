import React, { useState, useRef } from 'react';
import { WallPost, Collection } from '../types';

interface BuildersWallProps {
  userRole: 'client' | 'expert';
  wallPosts: WallPost[];
  onAddPost: (content: string, image?: string, video?: string) => void;
  collections: Collection[];
  onSavePost: (postId: string, collectionId: string) => void;
  onCreateCollection: (name: string, autoSavePostId?: string) => string;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onViewProfile: (authorName: string) => void;
}

export const BuildersWall: React.FC<BuildersWallProps> = ({ 
  userRole,
  wallPosts, 
  onAddPost, 
  collections, 
  onSavePost, 
  onCreateCollection,
  onLikePost,
  onAddComment,
  onViewProfile
}) => {
  const [activeSaveMenu, setActiveSaveMenu] = useState<string | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCollName, setNewCollName] = useState('');
  const [postInput, setPostInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [attachedMedia, setAttachedMedia] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleCreateAndSave = (postId: string) => {
    if (!newCollName.trim()) return;
    onCreateCollection(newCollName, postId);
    setNewCollName('');
    setActiveSaveMenu(null);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setAttachedMedia({
        url,
        type: file.type.startsWith('video') ? 'video' : 'image'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLocalPost = () => {
    if (!postInput.trim() && !attachedMedia) return;
    
    onAddPost(
      postInput, 
      attachedMedia?.type === 'image' ? attachedMedia.url : undefined,
      attachedMedia?.type === 'video' ? attachedMedia.url : undefined
    );
    
    setPostInput('');
    setAttachedMedia(null);
  };

  const handleCommentSubmit = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput);
    setCommentInput('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <input 
        type="file" 
        ref={mediaInputRef} 
        className="hidden" 
        accept="image/*,video/*" 
        onChange={handleMediaUpload} 
      />

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm ring-4 ring-slate-50">
        <div className="flex gap-4">
          <img src={userRole === 'client' ? "https://picsum.photos/seed/sarah/100/100" : "https://picsum.photos/seed/marcus/100/100"} className="w-12 h-12 rounded-2xl shadow-sm border border-slate-100" alt="Me" />
          <div className="flex-1">
            <textarea 
              value={postInput}
              onChange={(e) => setPostInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-violet-700 focus:bg-white outline-none resize-none font-medium transition-all text-slate-800 placeholder:text-slate-500"
              placeholder="Share a build achievement or a technical pro-tip..."
              rows={2}
            />
            
            {attachedMedia && (
              <div className="mt-4 relative rounded-2xl overflow-hidden border border-slate-200 group h-40 w-full bg-slate-950">
                {attachedMedia.type === 'image' ? (
                  <img src={attachedMedia.url} className="w-full h-full object-contain" alt="Attached preview" />
                ) : (
                  <video src={attachedMedia.url} className="w-full h-full object-contain" controls />
                )}
                <button 
                  onClick={() => setAttachedMedia(null)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-rose-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <button 
                onClick={() => mediaInputRef.current?.click()}
                className="text-violet-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-violet-50 px-4 py-2.5 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Neural Attach
              </button>
              <button onClick={handleLocalPost} disabled={!postInput.trim() && !attachedMedia} className="bg-violet-700 disabled:bg-slate-300 text-white px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-100 hover:bg-violet-800 transition-all">Broadcast Post</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {wallPosts.map(post => {
          const isLikedByMe = userRole === 'client' ? !!post.likedByClient : !!post.likedByExpert;
          
          return (
            <div key={post.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
              <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => onViewProfile(post.authorName)}
                      className="transition-transform hover:scale-110 active:scale-95 group/auth"
                    >
                      <img src={post.authorAvatar} className="w-10 h-10 rounded-xl border-2 border-slate-50 shadow-md group-hover/auth:shadow-violet-200" alt={post.authorName} />
                    </button>
                    <div className="text-left">
                      <button 
                        onClick={() => onViewProfile(post.authorName)}
                        className="font-black text-slate-950 hover:text-violet-700 transition-colors block leading-none uppercase text-xs tracking-tight"
                      >
                        {post.authorName}
                      </button>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5">{post.timestamp}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveSaveMenu(activeSaveMenu === post.id ? null : post.id)}
                      className={`p-2 rounded-xl transition-all ${collections.some(c => c.postIds.includes(post.id)) ? 'text-amber-600 bg-amber-50 scale-110' : 'text-slate-400 hover:text-violet-700 hover:bg-slate-50'}`}
                    >
                      <svg className="w-6 h-6" fill={collections.some(c => c.postIds.includes(post.id)) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </button>
                    
                    {activeSaveMenu === post.id && (
                      <div className="absolute right-0 top-12 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 p-5 animate-in fade-in slide-in-from-top-2">
                         <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Save to Build Hub</h5>
                         <div className="space-y-1 mb-4 max-h-48 overflow-y-auto pr-1">
                            {collections.map(c => (
                              <button 
                                key={c.id} 
                                onClick={() => { onSavePost(post.id, c.id); setActiveSaveMenu(null); }}
                                className="w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-black text-slate-700 hover:bg-violet-50 hover:text-violet-900 transition-all flex items-center justify-between uppercase tracking-tight"
                              >
                                 {c.name}
                                 {c.postIds.includes(post.id) && <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                              </button>
                            ))}
                         </div>
                         <div className="flex gap-2 border-t border-slate-50 pt-4">
                            <input value={newCollName} onChange={e => setNewCollName(e.target.value)} placeholder="New Group..." className="flex-1 bg-slate-50 border border-slate-100 text-[10px] px-4 py-2.5 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-violet-300 transition-all font-bold" />
                            <button onClick={() => handleCreateAndSave(post.id)} className="bg-violet-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase">Create</button>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-slate-800 leading-relaxed text-sm mb-6 font-medium">"{post.content}"</p>
              </div>

              {(post.image || post.video) && (
                <div className="px-8 mb-6">
                  <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
                    {post.image ? (
                      <img src={post.image} className="w-full h-auto max-h-[500px] object-contain mx-auto" alt="Post Build" />
                    ) : (
                      <video src={post.video} className="w-full h-auto max-h-[500px] object-contain mx-auto" controls />
                    )}
                  </div>
                </div>
              )}

              <div className="px-8 pb-4 flex items-center gap-6 border-t border-slate-50 pt-6">
                  <button 
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-2.5 transition-all transform active:scale-125 group/like ${isLikedByMe ? 'text-rose-700 font-black' : 'text-slate-500 hover:text-rose-700'}`}
                  >
                    <div className={`p-2 rounded-full transition-colors ${isLikedByMe ? 'bg-rose-50' : 'group-hover/like:bg-rose-50'}`}>
                      <svg className="w-5 h-5" fill={isLikedByMe ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">{post.likes} Build-Up</span>
                  </button>
                  <button 
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className={`flex items-center gap-2.5 transition-all group/comm ${activeCommentPostId === post.id ? 'text-violet-800 font-black' : 'text-slate-500 hover:text-violet-800'}`}
                  >
                    <div className={`p-2 rounded-full transition-colors ${activeCommentPostId === post.id ? 'bg-violet-50' : 'group-hover/comm:bg-violet-50'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">{post.comments?.length || 0} Comments</span>
                  </button>
              </div>

              <div className="px-8 pb-10 space-y-5">
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-4 pt-4">
                    {post.comments.map(comm => (
                      <div key={comm.id} className="flex gap-4 animate-in fade-in duration-500">
                        <button 
                          onClick={() => onViewProfile(comm.authorName)}
                          className="transition-opacity hover:opacity-80 flex-shrink-0"
                        >
                          <img src={comm.authorAvatar} className="w-8 h-8 rounded-xl border border-slate-100 shadow-sm" alt={comm.authorName} />
                        </button>
                        <div className="bg-slate-50 rounded-[1.5rem] px-5 py-3 flex-1 border border-slate-100">
                          <button 
                            onClick={() => onViewProfile(comm.authorName)}
                            className="text-[10px] font-black text-violet-700 uppercase tracking-widest hover:underline"
                          >
                            {comm.authorName}
                          </button>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed mt-1">{comm.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeCommentPostId === post.id && (
                  <div className="flex gap-4 items-center pt-4 animate-in slide-in-from-top-3 duration-300">
                    <img src={userRole === 'client' ? "https://picsum.photos/seed/sarah/100/100" : "https://picsum.photos/seed/marcus/100/100"} className="w-9 h-9 rounded-xl border border-slate-100 shadow-sm" alt="Me" />
                    <div className="flex-1 flex gap-3">
                      <input 
                        autoFocus
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                        placeholder="Join the discussion..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-violet-700 focus:bg-white outline-none transition-all placeholder:text-slate-400" 
                      />
                      <button 
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentInput.trim()}
                        className="bg-violet-700 disabled:bg-slate-200 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-100 transition-all"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};