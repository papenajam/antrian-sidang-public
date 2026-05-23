"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

interface FormProgressProps {
  steps: { id: string; title: string }[]
  currentStep: number
}

export function FormProgress({ steps, currentStep }: FormProgressProps) {
  return (
    <div className="mb-10" role="navigation" aria-label="Progress pendaftaran">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isPending = index > currentStep

          return (
            <div key={step.id} className="flex flex-1 items-start">
              <div className="relative flex flex-col items-center">
                {/* Step circle with animation */}
                <motion.div
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                    isCompleted && "border-primary bg-primary text-white shadow-lg shadow-primary/25",
                    isCurrent && "border-primary bg-white text-primary shadow-lg shadow-primary/25 ring-4 ring-primary/20",
                    isPending && "border-muted-foreground/30 bg-muted text-muted-foreground"
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                >
                  {/* Pulse animation for current step */}
                  {isCurrent && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/30 opacity-75" />
                  )}

                  {/* Check icon for completed steps */}
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>

                {/* Step title */}
                <motion.span
                  className={cn(
                    "mt-3 text-center text-xs font-semibold transition-colors sm:text-sm",
                    isCompleted && "text-primary",
                    isCurrent && "text-primary",
                    isPending && "text-muted-foreground"
                  )}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                >
                  {step.title}
                </motion.span>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-5 -z-10 w-full px-4">
                    <div className="h-1 w-full rounded-full bg-muted">
                      {/* Progress fill */}
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
                        initial={{ width: "0%" }}
                        animate={{ width: isCompleted ? "100%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}