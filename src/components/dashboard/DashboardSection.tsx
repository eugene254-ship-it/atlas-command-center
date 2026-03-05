import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  children: ReactNode;
  delay?: number;
}

const DashboardSection = ({ title, children, delay = 0 }: DashboardSectionProps) => (
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay }}
    className="space-y-4"
  >
    <h2 className="section-title">{title}</h2>
    {children}
  </motion.section>
);

export default DashboardSection;
