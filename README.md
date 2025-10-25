# Rooming Management System

A comprehensive real-time rooming management web application built with Next.js 15, NestJS 10, Prisma ORM, MySQL, and Socket.IO.

## 🚀 Features

- **Real-time Updates**: Live synchronization using Socket.IO
- **Room Management**: Create, update, and delete rooms with capacity limits
- **Member Management**: Join/leave rooms with user profiles
- **Gender-based Filtering**: Male, Female, and Mixed room options
- **Sheet Organization**: Group rooms by sheets/categories
- **Dashboard Analytics**: Comprehensive analytics and reporting
- **Responsive Design**: Mobile-first design with TailwindCSS

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 18** + TypeScript
- **TailwindCSS** for styling
- **Zustand** for state management
- **Socket.IO-client** for real-time updates
- **Axios** for API calls
- **Chart.js** for analytics
- **Shadcn/UI** components

### Backend
- **NestJS 10**
- **Prisma ORM** with MySQL
- **Socket.IO** for WebSockets
- **Class-validator** for validation
- **CUID** for unique IDs

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── prisma/          # Database service
│   │   ├── sheets/          # Sheet management
│   │   ├── rooms/           # 🏠 Rooming Management System

A comprehensive, real-time rooming management application built with modern technologies for efficient room allocation and member management.

## 🚀 Features

- **Real-time Updates**: Live room status and member changes using Socket.IO
- **Comprehensive Dashboard**: Manage rooms, members, and sheets with advanced filtering and search
- **Mobile-First Design**: Responsive interface optimized for all devices
- **Advanced UI Components**: Excel-like sheet selector with pagination
- **Complete CRUD Operations**: Full management of rooms, members, and organizational sheets
- **Interactive Room Cards**: Visual occupancy indicators and member listings
- **Confirmation Dialogs**: Safe deletion workflows with user confirmation
- **Search & Filter**: Real-time search with debounced input and multiple filter options
- **Pagination**: Efficient data handling with customizable page sizes

## 🛠 Technology Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Zustand** for state management
- **Socket.IO Client** for real-time updates
- **Shadcn/UI** for UI components
- **React Hook Form** for form handling

### Backend
- **NestJS 10** with TypeScript
- **Prisma ORM** with MySQL database
- **Socket.IO** for WebSocket connections
- **JWT Authentication** (ready for implementation)
- **Modular Architecture** with services and controllers

## 📁 Project Structure

```
rooming-management/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and API clients
│   └── store/               # Zustand state management
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   ├── prisma/          # Database schema and migrations
│   │   └── common/          # Shared utilities
│   └── test/                # Test files
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mehdi-lakhzouri/roomming-mangement.git
   cd roomming-mangement
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Setup database
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Run migrations
   npx prisma migrate dev
   npx prisma db seed
   
   # Start backend
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🎯 Key Features

### Dashboard Management
- **Rooms Dashboard**: Create, edit, and delete rooms with capacity management
- **Members Dashboard**: View and manage all room members across the system
- **Sheets Dashboard**: Organize rooms into logical sheets/categories

### Advanced UI Components
- **Responsive Sheet Selector**: Mobile-first Excel-like tab interface
- **Real-time Search**: Debounced search across all entities
- **Smart Filtering**: Multiple filter options with active state indicators
- **Pagination**: Efficient data navigation with customizable page sizes

### Real-time Features
- **Live Room Updates**: Instant capacity and member changes
- **Socket.IO Integration**: Real-time synchronization across all clients
- **Optimistic Updates**: Immediate UI updates with fallback handling

## 🔒 Security Features

- Input validation and sanitization
- CORS configuration
- Rate limiting ready for implementation
- JWT authentication structure prepared

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests  
cd frontend
npm run test
```

## 🚀 Deployment

### Backend Deployment
- Configure production database
- Set environment variables
- Deploy to your preferred platform (Railway, Heroku, AWS, etc.)

### Frontend Deployment
- Build the application: `npm run build`
- Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mehdi Lakhzouri**
- GitHub: [@mehdi-lakhzouri](https://github.com/mehdi-lakhzouri)

---

⭐ **If this project helped you, please give it a star!** ⭐
│   │   ├── users/           # User management
│   │   ├── members/         # Member management
│   │   └── websocket/       # Real-time events
│   └── prisma/
│       └── schema.prisma    # Database schema
├── frontend/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── lib/                 # Utilities (API, Socket)
│   └── store/               # Zustand store
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- npm or yarn

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/rooming_app"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

4. **Start the backend server**
   ```bash
   npm run start:dev
   ```
   Server will be running on `http://localhost:3001`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   Update the `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   ```

3. **Start the frontend server**
   ```bash
   npm run dev
   ```
   Application will be running on `http://localhost:3000`

## 📊 API Endpoints

### Sheets
- `GET /api/v1/sheets` - List all sheets with rooms
- `POST /api/v1/sheets` - Create new sheet
- `GET /api/v1/sheets/:id` - Get sheet details
- `DELETE /api/v1/sheets/:id` - Delete sheet

### Rooms
- `GET /api/v1/rooms?gender=MALE|FEMALE|MIXED` - List rooms with filter
- `POST /api/v1/rooms` - Create room
- `GET /api/v1/rooms/:id` - Get room details
- `PUT /api/v1/rooms/:id` - Update room
- `DELETE /api/v1/rooms/:id` - Delete room (if empty)
- `POST /api/v1/rooms/:id/join` - Join room
- `GET /api/v1/rooms/:id/members` - Get room members
- `DELETE /api/v1/rooms/:roomId/members/:memberId` - Remove member
- `PATCH /api/v1/rooms/:id/mark-full` - Mark room as full

### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user details
- `DELETE /api/v1/users/:id` - Delete user

### Members
- `GET /api/v1/members` - List all members
- `GET /api/v1/members/analytics` - Get analytics data

## 🔄 Real-time Events

The application uses Socket.IO for real-time updates:

- `room_created` - New room created
- `room_updated` - Room data updated
- `room_deleted` - Room deleted
- `member_joined` - User joined a room
- `member_left` - User left a room
- `sheet_created` - New sheet created
- `sheet_deleted` - Sheet deleted

## 🎨 UI Features

### Color Coding
- **Blue**: Male rooms
- **Pink**: Female rooms  
- **Purple**: Mixed rooms
- **Green**: Available rooms
- **Red**: Full rooms

### Components
- **RoomCard**: Display room information with join functionality
- **JoinRoomModal**: Modal form for joining rooms
- **GenderFilter**: Filter rooms by gender
- **SheetSelector**: Select specific sheets
- **DashboardLayout**: Admin dashboard layout

## 📈 Business Logic

### Room Management
- Room names must be unique per gender per sheet
- Users cannot join the same room twice
- Rooms auto-mark as full when capacity is reached
- Rooms auto-mark as available when members leave

### Member Management
- User creation/lookup happens during room join
- Cascading deletes for data integrity
- Real-time occupancy tracking

### Transaction Safety
- Join/leave operations use database transactions
- Rollback on errors
- Real-time event emission after successful operations

## 🚀 Deployment

### Backend
```bash
npm run build
npm run start:prod
```

### Frontend
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.