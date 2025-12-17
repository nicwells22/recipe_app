import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useFolderTree, useCreateFolder, useUpdateFolder, useDeleteFolder } from '@/hooks/useFolders';
import { Button, Input, Modal, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Folder as FolderType } from '@/types';

export default function Folders() {
  const { data: folders, isLoading } = useFolderTree();
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<FolderType | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [parentId, setParentId] = useState<number | undefined>();

  const handleCreate = () => {
    if (folderName.trim()) {
      createFolder.mutate(
        { name: folderName.trim(), description: folderDescription.trim() || undefined, parent_id: parentId },
        {
          onSuccess: () => {
            setShowCreateModal(false);
            setFolderName('');
            setFolderDescription('');
            setParentId(undefined);
          },
        }
      );
    }
  };

  const handleUpdate = () => {
    if (editingFolder && folderName.trim()) {
      updateFolder.mutate(
        { id: editingFolder.id, data: { name: folderName.trim(), description: folderDescription.trim() || undefined } },
        {
          onSuccess: () => {
            setEditingFolder(null);
            setFolderName('');
            setFolderDescription('');
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (deletingFolder) {
      deleteFolder.mutate(deletingFolder.id, {
        onSuccess: () => setDeletingFolder(null),
      });
    }
  };

  const openEditModal = (folder: FolderType) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderDescription(folder.description || '');
  };

  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  const toggleExpanded = (folderId: number) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderFolder = (folder: FolderType, depth = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group",
            depth > 0 && "border-l-2 border-gray-200 dark:border-gray-700 ml-4"
          )}
          style={{ paddingLeft: `${depth > 0 ? 12 : 12}px` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(folder.id)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
            ) : (
              <span className="w-6" />
            )}
            <Link
              to={`/recipes?folder_id=${folder.id}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <Folder className="h-5 w-5 text-secondary-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium truncate block">{folder.name}</span>
                {folder.description && (
                  <span className="text-sm text-gray-500 truncate block">{folder.description}</span>
                )}
              </div>
              <span className="text-sm text-gray-400 ml-2 shrink-0">
                {folder.recipe_count} recipe{folder.recipe_count !== 1 ? 's' : ''}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
            </Link>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
            <button
              onClick={() => {
                setParentId(folder.id);
                setShowCreateModal(true);
              }}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Add subfolder"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => openEditModal(folder)}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Edit folder"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeletingFolder(folder)}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-red-500"
              title="Delete folder"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-6">
            {folder.children!.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Folders</h1>
        <Button onClick={() => { setParentId(undefined); setShowCreateModal(true); }}>
          <Plus className="h-4 w-4 mr-1" />
          New Folder
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : folders && folders.length > 0 ? (
        <div className="card divide-y divide-gray-200 dark:divide-gray-700">
          {folders.map((folder) => renderFolder(folder))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <Folder className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No folders yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create folders to organize your recipes
          </p>
          <Button onClick={() => setShowCreateModal(true)}>Create Folder</Button>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setFolderName(''); setFolderDescription(''); setParentId(undefined); }}
        title={parentId ? 'Create Subfolder' : 'Create Folder'}
      >
        <div className="space-y-4">
          <Input
            label="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g., Desserts"
            autoFocus
          />
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              className="input"
              rows={2}
              value={folderDescription}
              onChange={(e) => setFolderDescription(e.target.value)}
              placeholder="What kind of recipes go here?"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); setFolderName(''); setFolderDescription(''); setParentId(undefined); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} isLoading={createFolder.isPending} disabled={!folderName.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!editingFolder}
        onClose={() => { setEditingFolder(null); setFolderName(''); setFolderDescription(''); }}
        title="Edit Folder"
      >
        <div className="space-y-4">
          <Input
            label="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            autoFocus
          />
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              className="input"
              rows={2}
              value={folderDescription}
              onChange={(e) => setFolderDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setEditingFolder(null); setFolderName(''); setFolderDescription(''); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} isLoading={updateFolder.isPending} disabled={!folderName.trim()}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deletingFolder}
        onClose={() => setDeletingFolder(null)}
        title="Delete Folder"
      >
        <p className="mb-6">
          Are you sure you want to delete "{deletingFolder?.name}"? Recipes in this folder will not be deleted.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeletingFolder(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleteFolder.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
