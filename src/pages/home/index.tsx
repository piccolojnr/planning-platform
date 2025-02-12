import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Clock,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { Helmet } from "react-helmet";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Project Planner - AI-Powered Project Planning</title>
        <meta
          name="description"
          content="Transform your ideas into actionable project plans with AI guidance. Break down complex projects into manageable tasks and track progress effortlessly."
        />

        <meta property="og:title" content="Project Planner" />
        <meta
          property="og:description"
          content="Transform your ideas into actionable project plans with AI guidance. Break down complex projects into manageable tasks and track progress effortlessly."
        />

        <meta property="twitter:title" content="Project Planner" />
        <meta
          property="twitter:description"
          content="Transform your ideas into actionable project plans with AI guidance. Break down complex projects into manageable tasks and track progress effortlessly."
        />

        <link rel="canonical" href="https://project-planner.vercel.app/" />

        <meta property="og:url" content="https://project-planner.vercel.app/" />
        <meta
          property="twitter:url"
          content="https://project-planner.vercel.app/"
        />

        <meta property="og:image" content="/site-image.jpg" />
      </Helmet>
      {/* Hero Section */}
      <section className="px-4 py-20 mx-auto text-center lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 border rounded-full text-sm font-medium mb-4 text-muted-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Project Planning
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Plan Your Projects with AI Assistance
          </h1>
          <p className="text-xl text-muted-foreground">
            Transform your ideas into actionable project plans with AI guidance.
            Break down complex projects into manageable tasks and track progress
            effortlessly.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            {user ? (
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <LinkButton size="lg" to="/signin">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </LinkButton>
                <LinkButton variant="outline" size="lg" to="/signup">
                  Create Account
                </LinkButton>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need for Project Planning
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="AI-Powered Planning"
              description="Get intelligent suggestions for project requirements, tasks, and timelines based on your project description."
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6" />}
              title="Task Management"
              description="Break down projects into tasks and subtasks. Track progress and dependencies with an intuitive interface."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Team Collaboration"
              description="Share projects with team members, assign roles, and work together seamlessly."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Progress Tracking"
              description="Monitor project progress, track completion status, and identify bottlenecks early."
            />
            <FeatureCard
              icon={<Share2 className="w-6 h-6" />}
              title="Easy Sharing"
              description="Share project plans with stakeholders and control access levels with viewer and editor roles."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Assistant"
              description="Get help with requirement analysis, task breakdown, and project optimization from our AI assistant."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Describe Your Project"
              description="Start by describing your project to our AI assistant. It will help you identify requirements and objectives."
            />
            <StepCard
              number="2"
              title="Generate Plan"
              description="The AI will generate a structured project plan with tasks, subtasks, and estimated timelines."
            />
            <StepCard
              number="3"
              title="Customize & Execute"
              description="Review and customize the plan, share with your team, and start executing with our tracking tools."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="max-w-3xl mx-auto text-center px-4 lg:px-8 trxt-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Project Planning?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/80">
            Join thousands of teams using AI to plan and execute projects more
            efficiently.
          </p>
          {!user && (
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-full md:w-auto"
            >
              <Link to="/signup">
                Start Planning Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative p-6 rounded-lg border bg-card">
      <div className="text-4xl font-bold text-primary/20 mb-4">{number}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
