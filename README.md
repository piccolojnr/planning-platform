
# **AI-Powered Project Planning Platform**  
🚀 **Simplify Project Planning with AI**  

This platform helps developers and teams create, customize, and manage project plans using AI. It generates plans based on user prompts, suggests requirements, allows customization, and provides step-by-step guidance for project execution.

---

## **Features**  
✨ **AI-Generated Project Plans**  
- Generate plans using Agile, Waterfall, Scrum, and other models.  
- Suggest technical and functional requirements.  

✨ **Interactive Plan Customization**  
- Add, edit, or delete tasks.  
- Adjust timelines and milestones.  

✨ **Build-to-Build Guidance**  
- Follow step-by-step instructions for project execution.  
- Each step includes links to resources or tutorials.  

✨ **Q&A and Support**  
- Ask questions about the plan or specific steps.  
- AI chatbot provides real-time answers.  

✨ **Save and Share Plans**  
- Save plans to the database.  
- Share plans with team members via a unique link.  

---

## **Tech Stack**  
🛠️ **Frontend**  
- React + TypeScript  
- Vite  
- Tailwind CSS  
- shadcn components  
- lucide-react icons  

🛠️ **Backend**  
- Supabase (PostgreSQL, Edge Functions, Realtime)  

🤖 **AI Integration**  
- Groq (LLaMA, GPT-NeoX, or other models)  

---

## **Getting Started**  
Follow these steps to set up the project locally.

### **Prerequisites**  
- Node.js (v18 or higher)  
- Supabase account  
- Groq API key  

### **Installation**  
1. Clone the repository:  
   ```bash
   git clone https://github.com/your-username/ai-project-planner.git
   cd ai-project-planner
   ```

2. Install dependencies:  
   ```bash
   npm install
   ```

3. Set up environment variables:  
   Create a `.env` file in the root directory and add the following:  
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GROQ_API_KEY=your-groq-api-key
   ```

4. Start the development server:  
   ```bash
   npm run dev
   ```

---

## **Supabase Setup**  
1. Create a new project in Supabase.  
2. Enable Edge Functions and Realtime.  
3. Create a `chat_messages` table:  
   ```sql
   CREATE TABLE chat_messages (
     id SERIAL PRIMARY KEY,
     project_id TEXT NOT NULL,
     role TEXT NOT NULL,
     content TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. Deploy the Edge Functions:  
   - `conversation-phase`: Handles the AI conversation.  
   - `plan-generation-phase`: Generates the project plan.  

---

## **Groq Integration**  
1. Sign up for Groq and get your API key.  
2. Use the Groq SDK to interact with the AI model.  
3. Update the Edge Functions to use the Groq API.  

---

## **Usage**  
1. **Start a Conversation**  
   - Enter a project description (e.g., "Build a task management app").  
   - The AI will ask questions to gather details.  

2. **Generate a Plan**  
   - Once the AI has enough information, it will respond with `<GENERATE>`.  
   - The platform will generate a structured project plan.  

3. **Customize the Plan**  
   - Add, edit, or delete tasks.  
   - Adjust timelines and milestones.  

4. **Follow the Plan**  
   - Use the step-by-step instructions to execute the project.  
   - Ask questions if you need help.  

---

## **Monetization**  
💰 **Freemium Model**  
- Basic features are free.  
- Advanced features (e.g., detailed plans, priority support) are paid.  

💰 **Subscription Plans**  
- Monthly or yearly subscriptions for access to premium tools and resources.  

💰 **Enterprise Plans**  
- Custom solutions for teams and organizations.  

💰 **Affiliate Marketing**  
- Recommend tools or services (e.g., hosting, project management software) and earn commissions.  

---

## **Contributing**  
Contributions are welcome! Follow these steps:  
1. Fork the repository.  
2. Create a new branch:  
   ```bash
   git checkout -b feature/your-feature-name
   ```  
3. Commit your changes:  
   ```bash
   git commit -m "Add your feature"
   ```  
4. Push to the branch:  
   ```bash
   git push origin feature/your-feature-name
   ```  
5. Open a pull request.  

---

## **License**  
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.  

---

## **Acknowledgments**  
- [Supabase](https://supabase.io) for the backend infrastructure.  
- [Groq](https://groq.com) for the AI integration.  
- [Vite](https://vitejs.dev) for the build tool.  
- [Tailwind CSS](https://tailwindcss.com) for styling.  

