// apps/desktop/src/features/study/layouts/DesktopStudyLayout.tsx
import React from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';

interface DesktopStudyLayoutProps {
 sidebar?: React.ReactNode;
 mainBoard: React.ReactNode;
 notesPanel?: React.ReactNode;
 inspectorPanel?: React.ReactNode;
 onResize?: (layout: any) => void;
 defaultLayout?: number[];
}

export function DesktopStudyLayout({
 sidebar,
 mainBoard,
 notesPanel,
 inspectorPanel,
 onResize,
 defaultLayout = [20, 55, 25]
}: DesktopStudyLayoutProps) {
 const hasRightPanel = !!(notesPanel || inspectorPanel);
 const hasLeftPanel = !!sidebar;

 if (!hasLeftPanel && !hasRightPanel) {
  return (
   <div className="h-full w-full bg-[var(--bg-primary)] overflow-hidden flex flex-col min-h-0">
    {mainBoard}
   </div>
  );
 }

 return (
  <div className="h-full w-full bg-[var(--bg-primary)] overflow-hidden flex flex-col min-h-0">
   <Group 
    orientation="horizontal" 
    onLayoutChange={onResize} 
    className="flex-1 h-full min-h-0" 
    style={{ height: '100%' }}
   >
    {/* Sidebar Panel */}
    {hasLeftPanel && (
     <>
      <Panel defaultSize={defaultLayout[0]} minSize={15} maxSize={30} className="min-h-0">
       <div className="h-full overflow-hidden flex flex-col panel-inner">
        {sidebar}
       </div>
      </Panel>
      <Separator className="w-px bg-[var(--border-color)] opacity-50" />
     </>
    )}
    
    {/* Main Board (Kanban / Dashboard) */}
    <Panel defaultSize={hasLeftPanel ? defaultLayout[1] : (hasRightPanel ? 70 : 100)} minSize={30} className="min-h-0">
     <div className="h-full bg-[var(--bg-primary)] overflow-hidden flex flex-col relative panel-inner min-h-0">
      {mainBoard}
     </div>
    </Panel>

    {/* Notes / Inspector Panel */}
    {hasRightPanel && (
     <>
      <Separator className="w-px bg-[var(--border-color)] opacity-50" />
      <Panel defaultSize={defaultLayout[2]} minSize={20} maxSize={40} className="bg-[var(--bg-card)] border-l border-[var(--border-color)] min-h-0">
       <div className="h-full overflow-hidden flex flex-col panel-inner">
        {notesPanel}
        {inspectorPanel && (
         <div className="border-t border-[var(--border-color)] flex-1 overflow-auto min-h-0 custom-scrollbar">
          {inspectorPanel}
         </div>
        )}
       </div>
      </Panel>
     </>
    )}
   </Group>
  </div>
 );
}
