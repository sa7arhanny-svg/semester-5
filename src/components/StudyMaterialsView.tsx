import React from 'react';
import { AcademicActivity, AttachedFile, AttachedLink } from '../types';
import { formatFileSize, openAttachedFile } from '../utils/fileHelpers';
import {
  FileText,
  ExternalLink,
  Eye,
  FileCode,
  Image,
  BookOpen,
  Paperclip,
} from 'lucide-react';

interface StudyMaterialsViewProps {
  activity: AcademicActivity;
  compact?: boolean;
}

export const StudyMaterialsView: React.FC<StudyMaterialsViewProps> = ({
  activity,
  compact = false,
}) => {
  const files: AttachedFile[] = activity.attachedFiles || [];
  const links: AttachedLink[] = [...(activity.attachedLinks || [])];

  // If there is a legacy attachmentUrl that isn't already in attachedLinks, include it
  if (activity.attachmentUrl && !links.some((l) => l.url === activity.attachmentUrl)) {
    links.push({
      id: 'legacy-link',
      url: activity.attachmentUrl,
      title: activity.attachmentName || 'Reference / Slides',
    });
  }

  const hasMaterials = files.length > 0 || links.length > 0;
  if (!hasMaterials) return null;

  const getFileBadgeColor = (filenameOrType: string) => {
    const ext = filenameOrType.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'bg-rose-50 text-rose-800 border-rose-200';
    if (['doc', 'docx'].includes(ext)) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (['ppt', 'pptx'].includes(ext)) return 'bg-amber-50 text-amber-900 border-amber-200';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    return 'bg-purple-50 text-purple-900 border-purple-200';
  };

  const getFileIcon = (filenameOrType: string) => {
    const ext = filenameOrType.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return Image;
    return FileText;
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {files.map((file) => {
          const Icon = getFileIcon(file.name);
          return (
            <button
              key={file.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openAttachedFile(file);
              }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors hover:shadow-2xs ${getFileBadgeColor(
                file.name
              )}`}
              title={`View ${file.name} (${formatFileSize(file.size)})`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[130px]">{file.name}</span>
              <Eye className="w-2.5 h-2.5 ml-0.5 opacity-70" />
            </button>
          );
        })}

        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition-colors"
            title={link.url}
          >
            <ExternalLink className="w-3 h-3 text-purple-600 shrink-0" />
            <span className="truncate max-w-[140px] font-mono">
              {link.title || link.url.replace(/^https?:\/\/(www\.)?/, '')}
            </span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2.5 p-3 rounded-2xl bg-[#FCFAF8] border border-[#F4DEE5] space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-purple-950">
        <span className="flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-purple-600" />
          <span>Study Materials</span>
        </span>
        <span className="text-[10px] font-mono text-purple-900/50">
          {files.length > 0 && `${files.length} file${files.length > 1 ? 's' : ''}`}
          {files.length > 0 && links.length > 0 && ' · '}
          {links.length > 0 && `${links.length} link${links.length > 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="space-y-1.5">
        {/* Uploaded Local Files */}
        {files.map((file) => {
          const Icon = getFileIcon(file.name);
          return (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-100/90 text-xs shadow-2xs hover:border-purple-200 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div className={`p-1 rounded-md border ${getFileBadgeColor(file.name)} shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-purple-950 truncate max-w-[200px] sm:max-w-[320px]">
                    {file.name}
                  </div>
                  <div className="text-[10px] text-purple-900/50 font-mono">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openAttachedFile(file);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-950 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200/70 transition-colors shrink-0 shadow-2xs"
                title="Open and view this study file"
              >
                <Eye className="w-3 h-3 text-purple-700" />
                <span>View</span>
              </button>
            </div>
          );
        })}

        {/* Saved Links */}
        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-100/90 text-xs shadow-2xs hover:border-purple-200 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="p-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-purple-950 truncate max-w-[200px] sm:max-w-[320px]">
                  {link.title || link.url}
                </div>
                <div className="text-[10px] text-purple-900/50 font-mono truncate max-w-[200px] sm:max-w-[320px]">
                  {link.url}
                </div>
              </div>
            </div>

            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-950 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200/70 transition-colors shrink-0 shadow-2xs"
              title="Open link in new browser tab"
            >
              <span>Open</span>
              <ExternalLink className="w-3 h-3 text-purple-700" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
