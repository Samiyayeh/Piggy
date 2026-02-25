<div align="center">
  <img src="public/piggy.png" alt="Piggy Logo" width="120" height="120" style="border-radius: 20px;" />
  <h1>🐽 Piggy (Paluwagan App)</h1>
  <p>A modern, real-time web application to manage and automate Paluwagan (Rotating Savings and Credit Association) groups.</p>
</div>

<br />

## 🎯 About The Project

Piggy digitizes the traditional _Paluwagan_ system, allowing friends, family, and coworkers to pool money together in cycles securely and transparently. A host can create a group, set a target contribution amount per cycle, and invite members via a unique join code. Members take turns receiving the total payout for the cycle.

This application was built with a strong focus on real-time data synchronization and a beautiful, intuitive user interface.

## ✨ Key Features

- **User Authentication**: Secure Login & Registration powered by Supabase Auth.
- **Group Management**:
  - Host new Paluwagan groups with a specific amount per cycle.
  - Generate and share 6-character random Join Codes.
  - Join existing groups easily from the dashboard.
- **Real-Time Syncing**: Instant UI updates across all clients when a user joins a group, a group is updated, or dates are checked off, using Supabase Realtime subscriptions.
- **Role-Based Access**: Specialized views and actions depending on if you are the Host or a Member of a specific group.
- **Payment Tracking Calendar**: Interactive modal calendars for hosts to track and check off payments for individual members.
- **Dark Mode Support**: Fully responsive styling that reacts to system preferences using Tailwind CSS.

## 🛠️ Built With

- **[React 19](https://react.dev/)** - The UI Library (via Vite)
- **[Supabase](https://supabase.com/)** - Open source Firebase alternative for Postgres Database, Authentication, and Real-time subscriptions.
- **[Tailwind CSS v4](https://tailwindcss.com/)** - For rapid, utility-first styling and glassmorphism UI elements.
- **[React Router v7](https://reactrouter.com/)** - For client-side routing and protected routes.
- **[Lucide React](https://lucide.dev/)** - For beautiful, consistent SVG icons.

## 🗄️ Database Schema Snapshot

The application relies on a relational Postgres database in Supabase:

- **`groups`**: Stores the Paluwagan group details (`id`, `title`, `host_id`, `amount_per_cycle`, `join_code`, `is_archived`).
- **`slots`**: The join table managing memberships and turns (`id`, `group_id`, `user_id`, `role`, `turn_number`, `checked_dates`).

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18+ recommended)
- npm
- A Supabase project

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your-username/piggy.git
   ```
2. Navigate to the project directory
   ```sh
   cd piggy
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Create a `.env` file in the root directory and enter your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Start the development server
   ```sh
   npm run dev
   ```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
