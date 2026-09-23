import React from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { BlastMascot, BlastMascotProps } from './BlastMascot.js';

export interface RiveBlastMascotProps extends BlastMascotProps {
  riveSrc?: string;
  stateMachine?: string;
}

export const RiveBlastMascot: React.FC<RiveBlastMascotProps> = ({
  riveSrc = '/blast-mascot.riv',
  stateMachine = 'BlastStateMachine',
  state = 'idle',
  size = 'md',
  mood = 'neutral',
  context = 'inline',
  className = '',
  onClick,
  interactive = true
}) => {
  // Try mounting Rive if a valid .riv asset exists
  const { rive, RiveComponent } = useRive({
    src: riveSrc,
    stateMachines: stateMachine,
    autoplay: true,
    onLoadError: () => {
      // Fallback seamlessly to native BlastMascot if .riv is not present
    }
  });

  // State machine inputs if using Rive
  const stateInput = useStateMachineInput(rive, stateMachine, 'State');
  const triggerSuccess = useStateMachineInput(rive, stateMachine, 'TriggerSuccess');

  React.useEffect(() => {
    if (stateInput) {
      const stateMap: Record<string, number> = {
        idle: 0,
        listening: 1,
        thinking: 2,
        processing: 3,
        speaking: 4,
        happy: 5,
        success: 6,
        error: 7,
        excited: 8,
        greeting: 9
      };
      stateInput.value = stateMap[state] ?? 0;
    }
    if (state === 'success' && triggerSuccess) {
      triggerSuccess.fire();
    }
  }, [state, stateInput, triggerSuccess]);

  // If Rive is ready and loaded, display Rive Canvas
  if (rive) {
    const sizeMap: Record<string, number> = {
      xs: 24,
      sm: 36,
      md: 52,
      lg: 84,
      xl: 130
    };
    const px = typeof size === 'number' ? size : sizeMap[size] || 52;

    return (
      <div
        style={{ width: px, height: px }}
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
        onClick={onClick}
      >
        <RiveComponent />
      </div>
    );
  }

  // Otherwise, default to our interactive high-fidelity BlastMascot engine
  return (
    <BlastMascot
      state={state}
      size={size}
      mood={mood}
      context={context}
      className={className}
      onClick={onClick}
      interactive={interactive}
    />
  );
};
export default RiveBlastMascot;
