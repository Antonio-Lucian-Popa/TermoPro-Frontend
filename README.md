# 🏗️ Termopan Manager — Frontend

Interfața web pentru aplicația **Termopan Manager**, un sistem intern dedicat firmelor care montează ferestre/termopane. Platforma oferă control complet asupra comenzilor, echipelor, taskurilor zilnice, programărilor și cererilor de timp liber.

---

## ⚙️ Tech Stack

- ⚛️ **React JS** (cu Vite)
- 🎨 **Tailwind CSS**
- 💠 **shadcn/ui** pentru componente UI moderne
- 🔁 **React Router v6+**
- 🔐 **Keycloak** (autentificare)
- 🔗 **Axios** pentru requesturi REST
- 📦 Structură modulară, scalabilă
- 📱 Fully **responsive**

---

## 🧱 Structura proiectului
```bash
📦 src/
    ├── assets/ # Imagini, logo, stiluri globale
    ├── components/ # Componente reutilizabile (Card, Modal, Table etc.)
    ├── pages/ # Pagini per funcționalitate (Dashboard, Orders, TimeOff...)
    ├── services/ # Servicii Axios pentru API
    ├── hooks/ # Hookuri utile (useAuth, useFetch etc.)
    ├── context/ # Auth context / User provider
    ├── routes/ # Configurare rute private/publice
    ├── App.tsx # Router + layout principal
    └── main.tsx # Entry point
```

## 🛠️ Funcționalități principale
✅ Login / Register cu Keycloak
✅ Dashboard personalizat în funcție de rol
✅ Management firme și angajați
✅ Creare și organizare echipe
✅ Taskuri zilnice (individuale sau pe echipă)
✅ Comentarii și poze pe fiecare task
✅ Cereri concediu / învoire
✅ Aprobare cereri de către OWNER
✅ Export date în PDF & Excel
✅ Interfață mobil-friendly

## 🔐 Roluri suportate
- OWNER – adminul firmei, control total
- MANAGER – poate crea taskuri și gestiona echipe
- TECHNICIAN – execută taskuri, poate comenta
- OPERATOR – doar vizualizare sau operațiuni de bază