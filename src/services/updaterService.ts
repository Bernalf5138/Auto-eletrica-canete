import { UPDATER_CONFIG } from '../config/updater';

export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
}

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  apkUrl?: string;
  exeUrl?: string;
  platform: 'android' | 'windows' | 'web';
}

function normalizeVersion(v: string): number[] {
  return v
    .replace(/^v/i, '')
    .trim()
    .split('.')
    .map((num) => parseInt(num, 10) || 0);
}

export function isNewerVersion(latest: string, current: string): boolean {
  const l = normalizeVersion(latest);
  const c = normalizeVersion(current);
  const maxLen = Math.max(l.length, c.length);

  for (let i = 0; i < maxLen; i++) {
    const lPart = l[i] ?? 0;
    const cPart = c[i] ?? 0;
    if (lPart > cPart) return true;
    if (lPart < cPart) return false;
  }
  return false;
}

export function detectPlatform(): 'android' | 'windows' | 'web' {
  const ua = navigator.userAgent.toLowerCase();
  // Capacitor Android or general Android userAgent
  if (ua.includes('android')) {
    return 'android';
  }
  if (ua.includes('electron') || ua.includes('windows')) {
    return 'windows';
  }
  return 'web';
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  const { githubOwner, githubRepo, currentVersion } = UPDATER_CONFIG;
  const platform = detectPlatform();

  const fallback: UpdateInfo = {
    hasUpdate: false,
    currentVersion,
    latestVersion: currentVersion,
    releaseName: '',
    releaseNotes: '',
    publishedAt: '',
    platform,
  };

  if (!githubOwner || !githubRepo) {
    return fallback;
  }

  try {
    const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/releases/latest`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      // Repositório ou release ainda não existente, trata normalmente
      return fallback;
    }

    const data = await response.json();
    const tagName: string = data.tag_name || '';
    const cleanLatest = tagName.replace(/^v/i, '').trim();

    const assets: any[] = data.assets || [];
    const apkAsset = assets.find((a) => a.name.toLowerCase().endsWith('.apk'));
    const exeAsset = assets.find((a) => a.name.toLowerCase().endsWith('.exe'));

    const hasUpdate = isNewerVersion(cleanLatest, currentVersion);

    return {
      hasUpdate,
      currentVersion,
      latestVersion: cleanLatest,
      releaseName: data.name || tagName,
      releaseNotes: data.body || 'Correções e melhorias gerais.',
      publishedAt: data.published_at || '',
      apkUrl: apkAsset?.browser_download_url,
      exeUrl: exeAsset?.browser_download_url,
      platform,
    };
  } catch (err) {
    console.warn('Erro ao verificar atualizações na nuvem:', err);
    return fallback;
  }
}
