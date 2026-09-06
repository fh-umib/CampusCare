import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import type { Notification, NotificationType } from '../../types/notification';
import { realtimeService } from '../../services/realtime';
import { useAuth } from '../../context/AuthContext';

const iconPaths: Record<NotificationType | 'bell' | 'arrow' | 'check' | 'retry', ReactNode> = {
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" /><path d="M10 21h4" /></>,
  help_request: <><path d="M4 5.5h16v11H9l-5 4v-15Z" /><path d="M8 10h8M8 13h5" /></>,
  reply: <><path d="M9 8 4 12l5 4" /><path d="M5 12h8c4 0 6 2 6 6" /></>,
  skill_check: <><circle cx="6" cy="12" r="2.3" /><circle cx="18" cy="6" r="2.3" /><circle cx="18" cy="18" r="2.3" /><path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8" /></>,
  stress: <><path d="M3 13h4l2-6 3.2 11 2.5-8 1.8 3H21" /><path d="M4 21h16" /></>,
  mood: <><circle cx="12" cy="12" r="9" /><path d="M8.2 10h.1M15.7 10h.1M7.8 15c1.2 1.5 2.6 2.2 4.2 2.2s3-.7 4.2-2.2" /></>,
  lost_found: <><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" /><circle cx="12" cy="10" r="2.4" /></>,
  profile: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21c.5-4.5 2.8-7 7-7s6.5 2.5 7 7" /></>,
  system: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12h8M12 8v8" /></>,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  retry: <><path d="M20 7v5h-5" /><path d="M19 12a7.5 7.5 0 1 0-2.2 5.3" /></>
};

const typeColors: Record<NotificationType, { color: string; background: string }> = {
  help_request: { color: '#0d9e8a', background: '#e8f8f5' },
  reply: { color: '#2563eb', background: '#eff6ff' },
  skill_check: { color: '#059669', background: '#ecfdf5' },
  stress: { color: '#d97706', background: '#fff7ed' },
  mood: { color: '#7c3aed', background: '#f5f3ff' },
  lost_found: { color: '#0891b2', background: '#ecfeff' },
  profile: { color: '#475569', background: '#f1f5f9' },
  system: { color: '#0b1d35', background: '#eef4f8' }
};

function BellIcon({ name, size = 19 }: { name: NotificationType | 'bell' | 'arrow' | 'check' | 'retry'; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>;
}

function timeLabel(value: string) {
  const timestamp = new Date(value).getTime();
  const elapsed = Date.now() - timestamp;
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  if (hours < 48) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(timestamp);
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ top: 70, left: 16, width: 400, maxHeight: 480 });
  const navigate = useNavigate();
  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  const loadNotifications = useCallback((showLoading = true) => {
    setError('');
    if (showLoading) setIsLoading(true);
    notificationService.list()
      .then(setNotifications)
      .catch(() => {
        setError('Notifications could not be loaded.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setNotifications([]);
    setIsOpen(false);
    loadNotifications(true);
  }, [loadNotifications, user?.id]);

  useEffect(() => {
    const removeConnect=realtimeService.on('connect',()=>loadNotifications(false));
    const removeNew=realtimeService.on<Notification>('notification:new',(notification)=>setNotifications(current=>current.some(item=>item.id===notification.id)?current:[notification,...current].slice(0,50)));
    const removeRead=realtimeService.on<{id:string}>('notification:read',({id})=>setNotifications(current=>current.map(item=>item.id===id?{...item,isRead:true}:item)));
    const removeAll=realtimeService.on('notification:read-all',()=>setNotifications(current=>current.map(item=>({...item,isRead:true}))));
    return()=>{removeConnect();removeNew();removeRead();removeAll()};
  }, [loadNotifications]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !dropdownRef.current?.contains(target)) setIsOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const mobile = viewportWidth <= 520;
    const width = mobile ? Math.max(280, viewportWidth - 32) : Math.min(400, viewportWidth - 32);
    const left = mobile
      ? 16
      : Math.max(16, Math.min(rect.right - width, viewportWidth - width - 16));
    const top = rect.bottom + 9;
    const maxHeight = Math.max(220, Math.min(480, viewportHeight - top - 16));

    setPosition({ top, left, width, maxHeight });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  async function openNotification(notification: Notification) {
    if (!notification.isRead) {
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
      try {
        await notificationService.markAsRead(notification.id);
      } catch {
        setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: false } : item));
      }
    }
    setIsOpen(false);
    if (notification.link) navigate(notification.link);
  }

  async function markAllAsRead() {
    const previous = notifications;
    try {
      setIsUpdating(true);
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      await notificationService.markAllAsRead();
    } catch {
      setNotifications(previous);
      setError('Notifications could not be updated.');
    } finally {
      setIsUpdating(false);
    }
  }

  function togglePanel() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) loadNotifications(!notifications.length);
  }

  return (
    <div className="cc-notification-root" ref={rootRef}>
      <style>{`
        .cc-notification-root{position:relative;flex:none}
        .cc-notification-button{position:relative;display:grid;width:40px;height:40px;place-items:center;border:1px solid rgba(13,158,138,.2);border-radius:11px;color:#0d7e70;background:linear-gradient(145deg,#fff,#f0fbf9);box-shadow:0 5px 14px rgba(15,23,42,.055);cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
        .cc-notification-button:hover,.cc-notification-button[aria-expanded="true"]{transform:translateY(-1px);border-color:rgba(13,158,138,.38);color:#0b6f63;box-shadow:0 8px 20px rgba(13,158,138,.12)}
        .cc-notification-count{position:absolute;top:-5px;right:-5px;display:grid;min-width:19px;height:19px;place-items:center;border:2px solid #fff;border-radius:999px;padding:0 3px;color:#fff;background:#0d9e8a;box-shadow:0 3px 8px rgba(13,158,138,.24);font-size:9px;font-weight:900}
        .cc-notification-panel{position:fixed;z-index:10000;display:flex;flex-direction:column;overflow:hidden;border:1px solid #dfeaf3;border-radius:22px;background:rgba(255,255,255,.98);box-shadow:0 24px 68px rgba(7,21,39,.22),0 3px 14px rgba(15,23,42,.08);backdrop-filter:blur(18px);animation:ccNotificationOpen .18s ease both;transform-origin:top right}
        .cc-notification-head{display:flex;flex:none;align-items:center;justify-content:space-between;gap:.8rem;border-bottom:1px solid #e8eff5;padding:14px 16px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,251,253,.94))}
        .cc-notification-head h2{margin:0;color:#0b1d35;font-family:"Sora",sans-serif;font-size:.94rem;line-height:1.25}
        .cc-notification-head p{margin:.16rem 0 0;color:#64748b;font-size:.64rem;line-height:1.35}
        .cc-notification-read-all{flex:none;border:1px solid rgba(13,158,138,.18);border-radius:8px;padding:.38rem .55rem;color:#0d7e70;background:#f0fbf9;font:inherit;font-size:.61rem;font-weight:800;cursor:pointer;transition:.18s ease}
        .cc-notification-read-all:hover{border-color:rgba(13,158,138,.32);background:#e5f8f4}
        .cc-notification-list{min-height:0;overflow-y:auto;padding:7px}
        .cc-notification-item{position:relative;display:grid;width:100%;grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:.7rem;margin:0 0 5px;border:1px solid #e8eff5;border-radius:13px;padding:.72rem .7rem .72rem .8rem;color:inherit;background:#fff;font:inherit;text-align:left;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}
        .cc-notification-item:last-child{margin-bottom:0}
        .cc-notification-item:hover{transform:translateY(-1px);border-color:rgba(13,158,138,.23);background:#fbfefd}
        .cc-notification-item.is-unread{border-color:rgba(13,158,138,.18);background:linear-gradient(135deg,rgba(13,158,138,.085),rgba(103,227,214,.07));box-shadow:inset 3px 0 0 #0d9e8a}
        .cc-notification-icon{display:grid;width:35px;height:35px;place-items:center;border-radius:10px}
        .cc-notification-copy{min-width:0}
        .cc-notification-title{display:flex;min-width:0;align-items:center;gap:6px;color:#0b1d35;font-size:.7rem;font-weight:750;line-height:1.35}
        .is-unread .cc-notification-title{font-weight:850}
        .cc-notification-dot{width:6px;height:6px;flex:none;border-radius:50%;background:#0d9e8a;box-shadow:0 0 0 3px rgba(13,158,138,.09)}
        .cc-notification-copy p{display:-webkit-box;overflow:hidden;margin:.2rem 0;color:#64748b;font-size:.63rem;line-height:1.42;-webkit-box-orient:vertical;-webkit-line-clamp:2}
        .cc-notification-copy time{display:block;color:#94a3b8;font-size:.56rem;font-weight:650}
        .cc-notification-arrow{align-self:center;color:#94a3b8}
        .cc-notification-empty,.cc-notification-error{display:grid;min-height:166px;place-items:center;align-content:center;gap:.42rem;margin:10px;padding:1rem;border:1px dashed #d7e4ed;border-radius:15px;text-align:center;background:linear-gradient(145deg,#fbfefd,#f4fafb)}
        .cc-notification-empty-icon,.cc-notification-error-icon{display:grid;width:42px;height:42px;place-items:center;border:1px solid rgba(13,158,138,.18);border-radius:13px;color:#0d9e8a;background:#e8f8f5}
        .cc-notification-empty h3,.cc-notification-error h3{margin:.15rem 0 0;color:#0b1d35;font-family:"Sora",sans-serif;font-size:.78rem}
        .cc-notification-empty p,.cc-notification-error p{max-width:285px;margin:0;color:#64748b;font-size:.64rem;line-height:1.5}
        .cc-notification-error{border-style:solid;border-color:#dfeaf3;background:#f8fbfd}
        .cc-notification-error-icon{color:#475569;background:#eef4f8}
        .cc-notification-retry{display:inline-flex;min-height:34px;align-items:center;gap:.35rem;margin-top:.25rem;border:1px solid rgba(13,158,138,.22);border-radius:8px;padding:.4rem .65rem;color:#0d7e70;background:#fff;font:inherit;font-size:.62rem;font-weight:800;cursor:pointer}
        .cc-notification-loading{display:grid;gap:6px;padding:9px}
        .cc-notification-skeleton{display:grid;grid-template-columns:35px minmax(0,1fr);align-items:center;gap:.7rem;min-height:64px;border:1px solid #e8eff5;border-radius:13px;padding:.7rem;background:#fff}
        .cc-notification-skeleton-icon,.cc-notification-skeleton-line{display:block;background:linear-gradient(100deg,#eaf1f7 24%,#f7fbff 42%,#eaf1f7 60%);background-size:220% 100%;animation:ccNotificationShimmer 1.6s ease-in-out infinite}
        .cc-notification-skeleton-icon{width:35px;height:35px;border-radius:10px}
        .cc-notification-skeleton-copy{display:grid;gap:.38rem}
        .cc-notification-skeleton-line{height:8px;border-radius:999px}
        .cc-notification-skeleton-line:first-child{width:48%}.cc-notification-skeleton-line:last-child{width:82%}
        @keyframes ccNotificationShimmer{to{background-position:-180% 0}}
        @keyframes ccNotificationOpen{from{opacity:0;transform:translateY(-5px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
        @media(max-width:520px){.cc-notification-panel{border-radius:18px}.cc-notification-head{padding:13px 14px}.cc-notification-list{max-height:none}.cc-notification-item{min-height:68px}.cc-notification-read-all{padding:.38rem .48rem}}
        @media(prefers-reduced-motion:reduce){.cc-notification-panel,.cc-notification-skeleton-icon,.cc-notification-skeleton-line{animation:none}}
      `}</style>
      <button ref={buttonRef} aria-expanded={isOpen} aria-haspopup="dialog" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} className="cc-notification-button" onClick={togglePanel} type="button">
        <BellIcon name="bell" />
        {unreadCount ? <span className="cc-notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
      </button>
      {isOpen ? createPortal(
        <section
          ref={dropdownRef}
          aria-label="Notifications"
          className="cc-notification-panel"
          style={{ top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight }}
        >
          <div className="cc-notification-head">
            <div><h2>Notifications</h2><p>Recent CampusCare updates</p></div>
            {unreadCount ? <button className="cc-notification-read-all" disabled={isUpdating} onClick={() => void markAllAsRead()} type="button">{isUpdating ? 'Updating...' : 'Mark all read'}</button> : null}
          </div>
          {isLoading ? <div aria-busy="true" aria-label="Loading notifications" className="cc-notification-loading">{[0, 1, 2].map((item) => <div className="cc-notification-skeleton" key={item}><span className="cc-notification-skeleton-icon" /><span className="cc-notification-skeleton-copy"><i className="cc-notification-skeleton-line" /><i className="cc-notification-skeleton-line" /></span></div>)}</div> : null}
          {error && !isLoading ? <div className="cc-notification-error"><span className="cc-notification-error-icon"><BellIcon name="retry" size={20} /></span><h3>Could not load notifications</h3><p>Please try again.</p><button className="cc-notification-retry" onClick={() => loadNotifications(true)} type="button"><BellIcon name="retry" size={14} />Retry</button></div> : null}
          {!isLoading && !error && !notifications.length ? <div className="cc-notification-empty"><span className="cc-notification-empty-icon"><BellIcon name="bell" size={20} /></span><h3>No notifications yet</h3><p>Updates about help requests, skills, mood, stress, and campus reports will appear here.</p></div> : null}
          {!isLoading && !error && notifications.length ? (
            <div className="cc-notification-list">
              {notifications.map((notification) => {
                const palette = typeColors[notification.type];
                return <button className={`cc-notification-item ${notification.isRead ? '' : 'is-unread'}`} key={notification.id} onClick={() => void openNotification(notification)} type="button"><span className="cc-notification-icon" style={{ color: palette.color, background: palette.background }}><BellIcon name={notification.type} /></span><span className="cc-notification-copy"><span className="cc-notification-title">{notification.title}{!notification.isRead ? <i className="cc-notification-dot" /> : null}</span><p>{notification.message}</p><time dateTime={notification.createdAt}>{timeLabel(notification.createdAt)}</time></span>{notification.link ? <span className="cc-notification-arrow"><BellIcon name="arrow" size={16} /></span> : null}</button>;
              })}
            </div>
          ) : null}
        </section>,
        document.body
      ) : null}
    </div>
  );
}
