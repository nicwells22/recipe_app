import { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Folder as FolderType } from '@/types';

interface FolderTreeProps {
  folders: FolderType[];
  selectedFolderIds?: number[];
  onSelect?: (folder: FolderType) => void;
  selectable?: boolean;
  showRecipeCount?: boolean;
}

interface FolderItemProps {
  folder: FolderType;
  depth: number;
  selectedFolderIds?: number[];
  onSelect?: (folder: FolderType) => void;
  selectable?: boolean;
  showRecipeCount?: boolean;
}

function FolderItem({ folder, depth, selectedFolderIds = [], onSelect, selectable, showRecipeCount }: FolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderIds.includes(folder.id);

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(folder);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg transition-colors',
          selectable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
          isSelected && 'bg-primary-50 dark:bg-primary-900/20'
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        
        <Folder className={cn(
          'h-5 w-5 shrink-0',
          isSelected ? 'text-secondary-500' : 'text-secondary-400'
        )} />
        
        <span className={cn(
          'flex-1 truncate',
          isSelected && 'font-medium text-primary-700 dark:text-primary-300'
        )}>
          {folder.name}
        </span>
        
        {showRecipeCount && (
          <span className="text-sm text-gray-400">
            {folder.recipe_count}
          </span>
        )}
        
        {isSelected && (
          <Check className="h-4 w-4 text-primary-600" />
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {folder.children!.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              selectedFolderIds={selectedFolderIds}
              onSelect={onSelect}
              selectable={selectable}
              showRecipeCount={showRecipeCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({ 
  folders, 
  selectedFolderIds = [], 
  onSelect, 
  selectable = true,
  showRecipeCount = false 
}: FolderTreeProps) {
  if (!folders || folders.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No folders available</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          depth={0}
          selectedFolderIds={selectedFolderIds}
          onSelect={onSelect}
          selectable={selectable}
          showRecipeCount={showRecipeCount}
        />
      ))}
    </div>
  );
}
