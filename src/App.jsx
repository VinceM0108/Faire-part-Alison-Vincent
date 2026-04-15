import React, { useEffect, useMemo, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';

/**
 * =========================================================
 * 1) PERSONNALISATION DU SITE
 * Modifie uniquement ce bloc pour adapter le faire-part
 * =========================================================
 */
const WEDDING = {
  bride: 'Alison',
  groom: 'Vincent',
  date: '2027-05-15T17:00:00',
  displayDate: 'Samedi 15 mai 2027',
  countdownLabel: 'Nous avons hâte de célébrer ce jour avec vous',
  city: 'Boucq',
  ceremonyTime: '17h00',
  ceremonyPlace: 'Église de Boucq',
  ceremonyAddress: '54200 Boucq',
  receptionTime: '19h00',
  receptionPlace: 'Château de Boucq',
  receptionDetails: 'Cocktail, dîner et soirée dansante dans les jardins et salons du château.',
  accommodationText:
    'Des logements sont disponibles sur place. Une participation de 45€ par adulte sera demandée pour la nuitée.',
  rsvpDeadline: '1er mars 2027',
  contactName: 'Vincent',
  contactEmail: 'votre-email@exemple.com',
  mapsCeremonyUrl: 'https://maps.google.com/?q=Eglise+de+Boucq',
  mapsReceptionUrl: 'https://maps.google.com/?q=Chateau+de+Boucq',
  introText:
    'Avec beaucoup de joie, nous vous invitons à partager l’un des plus beaux jours de notre vie. Votre présence à nos côtés rendra cette journée encore plus précieuse.',
  footerText:
    'Merci de votre réponse. Nous avons hâte de vivre ce moment avec vous.',
};

/**
 * =========================================================
 * 2) CONFIG FIREBASE
 * Colle ici la configuration de ton projet Firebase
 * Console Firebase > Paramètres du projet > Tes applis > App Web
 * =========================================================
 */
const firebaseConfig = {
  apiKey: "AIzaSyDOXGo07GPdkj3Glmuc-RTZ-8OiAZFUZAM",
  authDomain: "faire-part-f5bc7.firebaseapp.com",
  projectId: "faire-part-f5bc7",
  storageBucket: "faire-part-f5bc7.firebasestorage.app",
  messagingSenderId: "739107277735",
  appId: "1:739107277735:web:fb02dc9535f6ca28608482"
};

const APPS_SCRIPT_URL = "https://script.google.com/a/macros/eu.averydennison.com/s/AKfycby_a-E08WSZ6UAs-CuUPVr5DZSnLhuOLw6_w9cASHkePv7uMUO7bjQ_k4KgpdG3clE3IA/exec";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rsvpCollectionRef = collection(db, 'wedding-rsvps');

/* ------------------------- Icônes ------------------------- */
const IconHeart = () => (
  <svg viewBox="0 0 24 24" className="icon icon-heart" aria-hidden="true">
    <path d="M12 21s-6.716-4.353-9.193-8.03C.61 9.654 1.64 5.505 5.242 4.293 7.725 3.459 10 4.49 12 6.695c2-2.205 4.275-3.236 6.758-2.402 3.603 1.212 4.632 5.361 2.435 8.677C18.716 16.647 12 21 12 21Z" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <line x1="8" y1="2.5" x2="8" y2="6" />
    <line x1="16" y1="2.5" x2="16" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const IconMapPin = () => (
  <svg viewBox="0 0 24 24" className="icon icon-sm" aria-hidden="true">
    <path d="M12 21s-6-5.333-6-11a6 6 0 1 1 12 0c0 5.667-6 11-6 11Z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);

const IconHome = () => (
  <svg viewBox="0 0 24 24" className="icon icon-sm" aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" className="icon icon-sm" aria-hidden="true">
    <path d="m5 13 4 4L19 7" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" className="icon icon-sm" aria-hidden="true">
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 18a5.5 5.5 0 0 1 11 0" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M14.8 18a4.7 4.7 0 0 1 5.2-4.2" />
  </svg>
);

/* ---------------------- Composants UI ---------------------- */
function Countdown({ targetDate }) {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00' };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="countdown">
      <div className="countdown-item">
        <span>{timeLeft.days}</span>
        <small>Jours</small>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <span>{timeLeft.hours}</span>
        <small>Heures</small>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <span>{timeLeft.minutes}</span>
        <small>Minutes</small>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <span>{timeLeft.seconds}</span>
        <small>Secondes</small>
      </div>
    </div>
  );
}

function SectionTitle({ overline, title, text }) {
  return (
    <div className="section-title">
      {overline ? <p className="section-overline">{overline}</p> : null}
      <h2>{title}</h2>
      {text ? <p className="section-text">{text}</p> : null}
    </div>
  );
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    groupName: '',
    email: '',
    attending: 'yes',
    adults: 2,
    children: 0,
    accommodation: 'no',
    message: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Erreur authentification Firebase :', error);
      }
    };

    init();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const isAttending = formData.attending === 'yes';

  const totalGuests = useMemo(() => {
    if (!isAttending) return 0;
    return Number(formData.adults || 0) + Number(formData.children || 0);
  }, [formData.adults, formData.children, isAttending]);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const postToAppsScript = (payload) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = APPS_SCRIPT_URL;
  form.target = 'hidden_iframe';
  form.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'payload';
  input.value = JSON.stringify(payload);

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitError('');

  if (!user) {
    setSubmitError("L'authentification n'est pas encore prête. Réessaie dans quelques secondes.");
    return;
  }

  if (!formData.groupName.trim()) {
    setSubmitError('Merci de renseigner votre nom ou celui de votre famille.');
    return;
  }

  if (formData.attending === 'yes' && totalGuests <= 0) {
    setSubmitError('Merci de renseigner au moins un participant.');
    return;
  }

  const payload = {
    groupName: formData.groupName.trim(),
    email: formData.email.trim(),
    attending: formData.attending,
    adults: formData.attending === 'yes' ? Number(formData.adults || 0) : 0,
    children: formData.attending === 'yes' ? Number(formData.children || 0) : 0,
    accommodation: formData.attending === 'yes' ? formData.accommodation : 'no',
    message: formData.message.trim(),
    totalGuests: formData.attending === 'yes' ? totalGuests : 0,
  };

  try {
    setIsSubmitting(true);

    // 1) Enregistrement dans Firestore
    await addDoc(rsvpCollectionRef, {
      ...payload,
      createdAt: serverTimestamp(),
    });

    // 2) Envoi au Google Sheet via Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const resultText = await response.text();
    console.log('Apps Script response:', resultText);

    setSubmitted(true);
  } catch (error) {
    console.error(error);
    setSubmitError("Une erreur s'est produite lors de l'enregistrement.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="site-shell">
      <div className="background-blur background-blur-1" />
      <div className="background-blur background-blur-2" />

      <header className="hero">
        <div className="hero-inner container">
          <p className="hero-overline">Faire-part de mariage</p>
          <IconHeart />
          <h1 className="hero-title">
            {WEDDING.bride} <span>&</span> {WEDDING.groom}
          </h1>
          <p className="hero-date">{WEDDING.displayDate}</p>
          <p className="hero-location">{WEDDING.city}</p>
          <p className="hero-intro">{WEDDING.introText}</p>

          <div className="hero-card">
            <p className="hero-card-title">{WEDDING.countdownLabel}</p>
            <Countdown targetDate={WEDDING.date} />
          </div>

          <a href="#rsvp" className="primary-button">
            Répondre à l’invitation
          </a>
        </div>
      </header>

      <main>
        <section className="section container">
          <SectionTitle
            overline="Le programme"
            title="Une journée pleine d’émotion"
            text="Nous serions très heureux de vous retrouver pour célébrer notre union, partager un dîner, et prolonger la fête jusque tard dans la nuit."
          />

          <div className="event-grid">
            <article className="event-card">
              <div className="event-icon-wrap">
                <IconCalendar />
              </div>
              <h3>Cérémonie</h3>
              <p className="event-meta">
                <IconClock />
                <span>{WEDDING.ceremonyTime}</span>
              </p>
              <p className="event-place">{WEDDING.ceremonyPlace}</p>
              <p className="event-address">{WEDDING.ceremonyAddress}</p>
              <a
                className="secondary-link"
                href={WEDDING.mapsCeremonyUrl}
                target="_blank"
                rel="noreferrer"
              >
                <IconMapPin />
                Voir sur Google Maps
              </a>
            </article>

            <article className="event-card">
              <div className="event-icon-wrap">
                <IconHeart />
              </div>
              <h3>Réception</h3>
              <p className="event-meta">
                <IconClock />
                <span>{WEDDING.receptionTime}</span>
              </p>
              <p className="event-place">{WEDDING.receptionPlace}</p>
              <p className="event-address">{WEDDING.receptionDetails}</p>
              <a
                className="secondary-link"
                href={WEDDING.mapsReceptionUrl}
                target="_blank"
                rel="noreferrer"
              >
                <IconMapPin />
                Voir sur Google Maps
              </a>
            </article>

            <article className="event-card">
              <div className="event-icon-wrap">
                <IconHome />
              </div>
              <h3>Hébergement</h3>
              <p className="event-address">{WEDDING.accommodationText}</p>
              <p className="event-note">
                Merci de nous indiquer dans le formulaire si vous souhaitez dormir sur place.
              </p>
            </article>
          </div>
        </section>

        <section className="section container">
          <div className="details-panel">
            <div>
              <p className="section-overline">Informations</p>
              <h2>Ce que nous aimerions savoir</h2>
            </div>

            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-number">01</span>
                <div>
                  <h4>Présence</h4>
                  <p>Merci de confirmer votre venue avant le {WEDDING.rsvpDeadline}.</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-number">02</span>
                <div>
                  <h4>Nombre de participants</h4>
                  <p>Précise le nombre d’adultes et d’enfants présents dans ton groupe.</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-number">03</span>
                <div>
                  <h4>Logement</h4>
                  <p>Indique si vous souhaitez dormir sur place afin que nous puissions nous organiser.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="rsvp" className="section container">
          <div className="rsvp-wrapper">
            <div className="rsvp-left">
              <p className="section-overline">RSVP</p>
              <h2>Merci de nous répondre</h2>
              <p className="section-text">
                Votre réponse nous aidera à préparer cette journée dans les meilleures conditions.
              </p>
              <div className="mini-info-card">
                <p className="mini-info-title">Date limite de réponse</p>
                <p>{WEDDING.rsvpDeadline}</p>
              </div>
              <div className="mini-info-card">
                <p className="mini-info-title">Contact</p>
                <p>
                  {WEDDING.contactName}
                  <br />
                  {WEDDING.contactEmail}
                </p>
              </div>
            </div>

            <div className="rsvp-card">
              {!submitted ? (
                <form className="rsvp-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nom / Famille</label>
                    <input
                      type="text"
                      value={formData.groupName}
                      onChange={(e) => updateField('groupName', e.target.value)}
                      placeholder="Ex : Famille Martin"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="exemple@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Votre réponse</label>
                    <div className="choice-row">
                      <button
                        type="button"
                        className={`choice-button ${formData.attending === 'yes' ? 'is-active yes' : ''}`}
                        onClick={() => updateField('attending', 'yes')}
                      >
                        <IconCheck />
                        Présent(s)
                      </button>
                      <button
                        type="button"
                        className={`choice-button ${formData.attending === 'no' ? 'is-active no' : ''}`}
                        onClick={() => updateField('attending', 'no')}
                      >
                        <IconUsers />
                        Absent(s)
                      </button>
                    </div>
                  </div>

                  {isAttending ? (
                    <>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Adultes</label>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={formData.adults}
                            onChange={(e) => updateField('adults', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Enfants</label>
                          <input
                            type="number"
                            min="0"
                            max="12"
                            value={formData.children}
                            onChange={(e) => updateField('children', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Souhaitez-vous dormir sur place ?</label>
                        <div className="choice-row">
                          <button
                            type="button"
                            className={`choice-button ${formData.accommodation === 'yes' ? 'is-active yes' : ''}`}
                            onClick={() => updateField('accommodation', 'yes')}
                          >
                            Oui
                          </button>
                          <button
                            type="button"
                            className={`choice-button ${formData.accommodation === 'no' ? 'is-active no' : ''}`}
                            onClick={() => updateField('accommodation', 'no')}
                          >
                            Non
                          </button>
                        </div>
                      </div>
                    </>
                  ) : null}

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      rows="4"
                      value={formData.message}
                      onChange={(e) => updateField('message', e.target.value)}
                      placeholder="Un petit mot, une précision, une contrainte particulière..."
                    />
                  </div>

                  {submitError ? <p className="form-error">{submitError}</p> : null}

                  <button className="submit-button" type="submit" disabled={!authReady || isSubmitting}>
                    {isSubmitting ? 'Enregistrement...' : 'Envoyer ma réponse'}
                  </button>

                  <p className="form-note">
                    Les réponses sont enregistrées automatiquement dans Firebase.
                  </p>
                </form>
              ) : (
                <div className="success-state">
                  <div className="success-icon-wrap">
                    <IconCheck />
                  </div>
                  <h3>Merci pour votre réponse</h3>
                  <p>
                    Votre RSVP a bien été enregistré. Nous avons hâte de partager ce beau moment avec vous.
                  </p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        groupName: '',
                        email: '',
                        attending: 'yes',
                        adults: 2,
                        children: 0,
                        accommodation: 'no',
                        message: '',
                      });
                    }}
                  >
                    Envoyer une autre réponse
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <p>
            {WEDDING.bride} & {WEDDING.groom} — {WEDDING.displayDate}
          </p>
          <p>{WEDDING.footerText}</p>
        </div>
      </footer>
      <iframe
  name="hidden_iframe"
  style={{ display: 'none' }}
  title="hidden_iframe"
      />
    </div>
  );
}
