import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Link2, ShieldCheck, Sparkles, Smartphone } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const Landing: React.FC = () => {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="landing-page">
        <section className="landing-hero">
          <div className="landing-hero__content">
            <div className="landing-eyebrow">
              <Sparkles size={16} />
              Short links built for modern teams
            </div>
            <h1>Turn every long URL into a beautiful, measurable click path.</h1>
            <p>
              Create branded short links, protect every destination, and unlock real-time analytics
              that help your audience engage and convert.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">
                Start for free
                <ArrowRight size={16} />
              </Link>
              <Link to="/dashboard" className="btn btn-secondary">
                Open dashboard
              </Link>
            </div>

            <div className="hero-card">
              <div className="hero-card__input-row">
                <input type="url" placeholder="Paste a long URL to shorten" />
                <button className="btn btn-primary">Shorten</button>
              </div>
              <div className="hero-card__meta">No credit card required • Powerful analytics included</div>
            </div>
          </div>

          <div className="landing-hero__visual">
            <div className="visual-card">
              <div className="visual-badge">Live analytics</div>
              <div className="visual-link-row">
                <Link2 size={18} />
                <span>shorty/launch</span>
              </div>
              <div className="visual-stats">
                <div>
                  <strong>24.8k</strong>
                  <span>clicks</span>
                </div>
                <div>
                  <strong>68%</strong>
                  <span>mobile</span>
                </div>
                <div>
                  <strong>7.2x</strong>
                  <span>engagement</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-stats">
          <div>
            <strong>150M+</strong>
            <span>links created</span>
          </div>
          <div>
            <strong>4.9/5</strong>
            <span>team satisfaction</span>
          </div>
          <div>
            <strong>99.9%</strong>
            <span>uptime</span>
          </div>
        </section>

        <section className="landing-features">
          <div className="section-heading">
            <h2>Built for fast-moving brands</h2>
            <p>Everything you need to manage short links with confidence and clarity.</p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">
                <Link2 size={20} />
              </div>
              <h3>Instant link shortening</h3>
              <p>Turn long destinations into clean, memorable links in seconds.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={20} />
              </div>
              <h3>Real-time insights</h3>
              <p>Track clicks, devices, countries, and engagement trends as they happen.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <ShieldCheck size={20} />
              </div>
              <h3>Secure and reliable</h3>
              <p>Protect your links with controlled expiry dates and clean management tools.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <Smartphone size={20} />
              </div>
              <h3>Mobile-ready experience</h3>
              <p>Manage your short links from anywhere with a polished, responsive UI.</p>
            </article>
          </div>
        </section>

        <section className="landing-cta">
          <h2>Ready to launch your first smart link?</h2>
          <p>Join teams that use thoughtful link management to drive better engagement every day.</p>
          <Link to="/register" className="btn btn-primary">
            Create your account
          </Link>
        </section>
      </main>
    </div>
  );
};
