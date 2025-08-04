import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      const sections = ["hero", "features", "how-it-works", "benefits"];
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", section: "hero" },
    { label: "Features", section: "features" },
    { label: "How It Works", section: "how-it-works" },
    { label: "Benefits", section: "benefits" },
    { label: "Offers", section: "offers", isRoute: true, route: "/PublicOffersPage" },
  ];

  const handleNavClick = (item) => {
    if (item.isRoute) {
      navigate(item.route);
    } else {
      // Pour les sections de la page actuelle
      const element = document.getElementById(item.section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 
          ? "bg-background/90 backdrop-blur-md shadow-lg border-b border-border" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <motion.div 
            className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-3"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-primary-foreground font-bold text-xl">P</span>
          </motion.div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-foreground">Talent Go</h1>
            <p className="text-xs text-primary">Academic & Professional Gateway</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            item.isRoute ? (
              <button
                key={item.section}
                onClick={() => handleNavClick(item)}
                className="text-sm transition-colors text-muted-foreground hover:text-primary cursor-pointer"
              >
                {item.label}
              </button>
            ) : (
              <a
                key={item.section}
                href={`#${item.section}`}
                className={`text-sm transition-colors relative ${
                  activeSection === item.section 
                    ? "text-primary font-medium" 
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.label}
                {activeSection === item.section && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </a>
            )
          ))}
          <motion.button
            className="text-primary px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </motion.button>
          <motion.button
            className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signin')}
          >
            Login
          </motion.button>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-foreground" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </motion.div>
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-background border-t border-border shadow-lg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navItems.map((item) => (
                item.isRoute ? (
                  <button
                    key={item.section}
                    onClick={() => {
                      handleNavClick(item);
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm transition-colors text-muted-foreground text-left"
                  >
                    <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                      {item.label}
                    </motion.div>
                  </button>
                ) : (
                  <a
                    key={item.section}
                    href={`#${item.section}`}
                    className={`text-sm transition-colors ${
                      activeSection === item.section 
                        ? "text-primary font-medium" 
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                      {item.label}
                    </motion.div>
                  </a>
                )
              ))}
              <motion.button
                className="text-primary border border-primary px-6 py-2 rounded-full text-sm font-medium w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate('/signup');
                  setMobileMenuOpen(false);
                }}
              >
                Sign Up
              </motion.button>
              <motion.button
                className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate('/signin');
                  setMobileMenuOpen(false);
                }}
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;

