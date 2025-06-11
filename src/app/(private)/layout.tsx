"use client";

import React from 'react';
import Link from 'next/link';
import routePath from '@/routes';

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="content-layout" dir="rtl">
      <header className="content-header">
        <nav className="content-nav">
          <div className="nav-logo">
            <Link href={routePath.dashboard.p}>שיבוץ +</Link>
          </div>
          <div className="nav-links">
            <Link href={routePath.dashboard.p}>לוח בקרה</Link>
            <Link href={routePath.about.p}>אודות</Link>
            <Link href={routePath.connect.p}>צור קשר</Link>
            <Link href={routePath.login.p}>התנתק</Link>
          </div>
        </nav>
      </header>
      
      <main className="content-main">{children}</main>
      
      <footer className="content-footer">
        <p>© {new Date().getFullYear()} שיבוץ + | כל הזכויות שמורות</p>
      </footer>
      
      <style jsx>{`
        .content-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .content-header {
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 1rem 2rem;
        }
        
        .content-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        
        .nav-logo a {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--title-color);
          text-decoration: none;
        }
        
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        
        .nav-links a {
          color: var(--description-text);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .nav-links a:hover {
          color: var(--title-color);
        }
        
        .content-main {
          flex: 1;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        
        .content-footer {
          background-color: #f5f5f5;
          padding: 1.5rem;
          text-align: center;
          color: var(--description-text);
        }
      `}</style>
    </div>
  );
}
