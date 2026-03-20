import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDOXGo07GPdkj3Glmuc-RTZ-8OiAZFUZAM",
  authDomain: "faire-part-f5bc7.firebaseapp.com",
  projectId: "faire-part-f5bc7",
  storageBucket: "faire-part-f5bc7.firebasestorage.app",
  messagingSenderId: "739107277735",
  appId: "1:739107277735:web:fb02dc9535f6ca28608482"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Assainissement de l'appId (Firestore nécessite un nombre impair de segments dans le chemin)
const appId = 'mariage-boucq-2027';

// --- ICONS (SVG NATIFS POUR ÉVITER LES ERREURS DE RENDU) ---
const IconHeart = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-6 text-amber-600"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IconMapPin = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400"><path d="m6 9 6 6 6-6"/></svg>;

// --- COMPOSANTS INTERNES ---

const TimeUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <span className="text-3xl md:text-5xl font-light">{value}</span>
    <span className="text-[10px] md:text-xs uppercase tracking-widest text-stone-400">{label}</span>
  </div>
);

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 md:gap-8 justify-center font-sans">
      <TimeUnit value={timeLeft.days} label="Jours" />
      <span className="text-3xl md:text-5xl font-thin text-stone-200 self-center">:</span>
      <TimeUnit value={timeLeft.hours} label="Heures" />
      <span className="text-3xl md:text-5xl font-thin text-stone-200 self-center">:</span>
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <span className="text-3xl md:text-5xl font-thin text-stone-200 self-center">:</span>
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---

export default function App() {
  const [user, setUser] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    attending: 'yes',
    adults: 1,
    children: 0,
    accommodation: 'no'
  });

  const targetDate = new Date('2027-05-15T17:00:00');

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth Error", err);
      }
    };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Utilisation du chemin assaini pour éviter l'erreur de segments Firestore
    const rsvpRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');
    const unsubscribe = onSnapshot(rsvpRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResponses(data);
    }, (error) => console.error("Firestore Error:", error));
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const rsvpRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');
      await addDoc(rsvpRef, {
        ...formData,
        timestamp: new Date().toISOString(),
        userId: user.uid
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-serif selection:bg-amber-100 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center p-6 bg-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q 25 0 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#pattern)"/>
          </svg>
        </div>
        
        <div className="z-10 animate-fade-in">
          <IconHeart />
          <h1 className="text-5xl md:text-7xl font-light mb-4 tracking-widest text-stone-900 uppercase">Nous nous marions</h1>
          <p className="text-xl md:text-2xl italic text-stone-600 mb-8">Le 15 Mai 2027</p>
          <Countdown targetDate={targetDate} />
        </div>
        
        <div className="absolute bottom-10 animate-bounce">
          <IconChevronDown />
        </div>
      </section>

      {/* Infos Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-600">
            <IconClock />
          </div>
          <h2 className="text-2xl mb-4">La Cérémonie</h2>
          <p className="font-sans text-stone-600 leading-relaxed">
            Rendez-vous à <span className="font-bold">17h00</span><br />
            Église de Boucq<br />
            54200 Boucq
          </p>
          <button className="mt-6 text-amber-700 font-sans text-sm flex items-center gap-2 hover:underline">
            <IconMapPin /> Voir sur Google Maps
          </button>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-600">
            <IconCalendar />
          </div>
          <h2 className="text-2xl mb-4">La Réception</h2>
          <p className="font-sans text-stone-600 leading-relaxed">
            À partir de <span className="font-bold">19h00</span><br />
            Château de Boucq<br />
            Un cocktail sera servi dans les jardins.
          </p>
          <div className="mt-6 flex items-center gap-2 text-amber-700 font-sans text-sm">
             <IconHome /> Logements sur place
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="max-w-2xl mx-auto px-6 py-20">
        <div className="bg-amber-50 rounded-[2rem] p-8 md:p-12 border border-amber-100 shadow-xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl mb-4">Réponse Souhaitée</h2>
            <p className="text-stone-600 italic">Merci de confirmer votre présence avant le 1er Mars 2027</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 font-sans">
              <div>
                <label className="block text-sm font-medium mb-2">Nom & Prénom</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="Ex: Famille Martin"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, attending: 'yes'})}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.attending === 'yes' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-stone-100 text-stone-500'}`}
                >
                  <IconCheck /> Présent(s)
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, attending: 'no'})}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.attending === 'no' ? 'bg-stone-600 text-white border-stone-600' : 'bg-white border-stone-100 text-stone-500'}`}
                >
                  <IconUsers /> Absent(s)
                </button>
              </div>

              {formData.attending === 'yes' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Adultes</label>
                      <input 
                        type="number" min="1" max="10"
                        className="w-full p-3 rounded-xl border border-stone-200"
                        value={formData.adults}
                        onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Enfants</label>
                      <input 
                        type="number" min="0" max="10"
                        className="w-full p-3 rounded-xl border border-stone-200"
                        value={formData.children}
                        onChange={(e) => setFormData({...formData, children: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-inner">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-5 h-5 accent-amber-600"
                        checked={formData.accommodation === 'yes'}
                        onChange={(e) => setFormData({...formData, accommodation: e.target.checked ? 'yes' : 'no'})}
                      />
                      <div>
                        <span className="font-bold block mb-1 text-stone-800 text-sm">Dormir sur place ?</span>
                        <span className="text-xs text-stone-600 leading-relaxed block">
                          Logements disponibles au château (45€ par adulte). RIB communiqué par la suite.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <button 
                disabled={isSubmitting || !user}
                className="w-full bg-amber-900 text-white p-4 rounded-xl font-bold hover:bg-amber-950 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? "Envoi..." : "Confirmer ma réponse"}
              </button>
            </form>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <IconCheck />
              </div>
              <h3 className="text-2xl mb-2 font-serif">Merci beaucoup !</h3>
              <p className="text-stone-600 font-sans text-sm">Votre réponse a bien été enregistrée.</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 text-amber-700 text-xs font-sans hover:underline uppercase tracking-widest">Modifier</button>
            </div>
          )}
        </div>
      </section>

      {/* Admin Panel */}
      <footer className="py-20 bg-stone-100 px-6 font-sans text-center">
        <p className="text-stone-400 text-[10px] mb-4 italic uppercase tracking-widest">Mariage de Boucq • 2027</p>
        <button 
          onClick={() => setShowAdmin(!showAdmin)}
          className="text-stone-300 hover:text-stone-600 transition-colors text-[10px] uppercase tracking-widest"
        >
          {showAdmin ? "Fermer" : "Admin"}
        </button>

        {showAdmin && (
          <div className="mt-10 max-w-4xl mx-auto text-left bg-white rounded-2xl p-6 shadow-sm border border-stone-200 overflow-x-auto">
            <h4 className="text-lg font-serif mb-6 flex items-center gap-2 uppercase tracking-tighter">
                <IconUsers /> Suivi des invités
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                    <p className="text-[9px] text-stone-400 uppercase tracking-tighter">Réponses</p>
                    <p className="text-xl font-bold">{responses.length}</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                    <p className="text-[9px] text-stone-400 uppercase tracking-tighter">Total</p>
                    <p className="text-xl font-bold">{responses.filter(r => r.attending === 'yes').reduce((acc, curr) => acc + (curr.adults || 0) + (curr.children || 0), 0)}</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                    <p className="text-[9px] text-stone-400 uppercase tracking-tighter">Logements</p>
                    <p className="text-xl font-bold">{responses.filter(r => r.accommodation === 'yes').length}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                    <p className="text-[9px] text-amber-600 uppercase tracking-tighter">Collecte</p>
                    <p className="text-xl font-bold text-amber-700">{responses.filter(r => r.accommodation === 'yes').reduce((acc, curr) => acc + ((curr.adults || 0) * 45), 0)}€</p>
                </div>
            </div>

            <table className="w-full text-[10px]">
              <thead className="bg-stone-50 text-stone-400 border-b">
                <tr>
                  <th className="p-2 text-left uppercase">Nom</th>
                  <th className="p-2 text-center uppercase">Présence</th>
                  <th className="p-2 text-center uppercase">Ad/Enf</th>
                  <th className="p-2 text-center uppercase">Log.</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((resp) => (
                  <tr key={resp.id} className="border-b hover:bg-stone-50 transition-colors">
                    <td className="p-2 font-medium">{resp.name}</td>
                    <td className="p-2 text-center">
                        {resp.attending === 'yes' ? <span className="text-green-600 font-bold uppercase">Oui</span> : <span className="text-stone-300 italic">Non</span>}
                    </td>
                    <td className="p-2 text-center">
                        {resp.attending === 'yes' ? `${resp.adults || 0}/${resp.children || 0}` : '-'}
                    </td>
                    <td className="p-2 text-center">
                        {resp.accommodation === 'yes' ? <span className="text-amber-600 font-bold uppercase">Oui</span> : 'Non'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}