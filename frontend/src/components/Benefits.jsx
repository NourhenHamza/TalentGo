import { motion } from "framer-motion";
import { 
  Clock, 
  TrendingUp, 
  Shield, 
  Heart,
  Zap,
  Users,
  CheckCircle2
} from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Save 75% of Administrative Time",
      description: "Automated workflows eliminate repetitive tasks, allowing educators to focus on what matters most - teaching and mentoring.",
      stat: "75%",
      statLabel: "Time Saved"
    },
    {
      icon: TrendingUp,
      title: "Improve Student Success Rates",
      description: "Data-driven matching and continuous tracking lead to higher completion rates and better career outcomes.",
      stat: "90%",
      statLabel: "Success Rate"
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Bank-level encryption and compliance standards ensure all academic data remains secure and private.",
      stat: "100%",
      statLabel: "Secure"
    }
  ];

  const features = [
    "Real-time progress tracking and analytics",
    "Automated deadline reminders and notifications",
    "Integrated communication tools",
    "Skill-based matching algorithms",
    "Digital document management",
    "Multi-institutional collaboration",
    "Mobile-responsive design",
    "24/7 customer support"
  ];

  return (
    <section id="benefits" className="py-20 md:py-32 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Heart className="w-4 h-4" />
            Why Choose AcademIQ
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Transform Your Institution with 
            <span className="text-primary"> Proven Results</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of educational institutions that have revolutionized their 
            academic management with measurable improvements in efficiency and outcomes.
          </p>
        </motion.div>

        {/* Main Benefits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <motion.div
                className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 text-center relative overflow-hidden"
                whileHover={{ 
                  y: -10,
                  boxShadow: "var(--shadow-elegant)"
                }}
              >
                {/* Background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId={`benefit-bg-${index}`}
                />

                {/* Icon */}
                <motion.div
                  className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <benefit.icon className="w-10 h-10 text-primary" />
                </motion.div>

                {/* Stat */}
                <motion.div
                  className="mb-4"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl font-bold text-primary mb-1">{benefit.stat}</div>
                  <div className="text-sm text-muted-foreground">{benefit.statLabel}</div>
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-4 text-card-foreground group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-card-foreground">
              Everything You Need in 
              <span className="text-primary"> One Platform</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 group"
                >
                  <motion.div
                    className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                    whileHover={{ scale: 1.2 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="text-card-foreground group-hover:text-primary transition-colors">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-2xl border border-border"
              whileHover={{ 
                boxShadow: "var(--shadow-elegant)",
                scale: 1.02
              }}
            >
              <div className="text-center">
                <motion.div
                  className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Users className="w-12 h-12 text-primary-foreground" />
                </motion.div>
                
                <h4 className="text-xl font-semibold mb-4 text-card-foreground">
                  Trusted by Leading Institutions
                </h4>
                
                <p className="text-muted-foreground mb-6">
                  Universities worldwide rely on AcademIQ to manage their academic programs 
                  and connect students with meaningful opportunities.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;