import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Target, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: 'Goal-Driven',
      description: 'Break big dreams into achievable daily habits',
    },
    {
      icon: TrendingUp,
      title: 'Visual Progress',
      description: 'See your growth with beautiful progress tracking',
    },
    {
      icon: Sparkles,
      title: 'Stay Motivated',
      description: 'Gentle reminders and streak rewards keep you going',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="p-2 rounded-xl bg-primary/10">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-semibold text-foreground">Bloom</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="container mx-auto px-4 pt-16 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Your habits, your growth
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Turn your goals into
            <span className="text-gradient-primary block">daily victories</span>
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Bloom helps you break down life goals into small, achievable habits. 
            Watch yourself grow, one day at a time.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="group"
            >
              Start for free
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
            >
              I have an account
            </Button>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-6 rounded-2xl bg-card border border-border shadow-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Growth illustration */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="inline-flex items-end gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="bg-primary/20 rounded-t-lg"
                style={{ width: 24, height: i * 16 }}
                initial={{ height: 0 }}
                animate={{ height: i * 16 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Consistent small steps lead to big results
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2024 Bloom. Made with 💚</span>
          <span>Free forever</span>
        </div>
      </footer>
    </div>
  );
}
