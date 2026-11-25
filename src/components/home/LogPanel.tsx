/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 * 
 * LogPanel.tsx file
 * 
 */
import React, { useMemo, useState } from 'react';
import { DiagnosticLog, DiagnosticStatusLevel, Time } from '../../types';
import { Box, Typography, Paper, useTheme } from '@mui/material';

interface LogPanelProps {
  logs: Record<number, DiagnosticLog[]>;
  onClear: () => void;
}

const LEVELS: number[] = [
  DiagnosticStatusLevel.OK,
  DiagnosticStatusLevel.WARN,
  DiagnosticStatusLevel.ERROR,
  DiagnosticStatusLevel.STALE,
];

const LEVEL_DATA: Record<number, { label: string; color: string }> = {
  [DiagnosticStatusLevel.OK]: { label: 'OK', color: '#4ade80' },
  [DiagnosticStatusLevel.WARN]: { label: 'WARN', color: '#facc15' },
  [DiagnosticStatusLevel.ERROR]: { label: 'ERROR', color: '#f87171' },
  [DiagnosticStatusLevel.STALE]: { label: 'STALE', color: '#94a3b8' },
};

const formatStamp = (stamp: Time): string =>
  new Date(stamp.sec * 1000 + Math.floor(stamp.nanosec / 1e6)).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const compareStamp = (a: DiagnosticLog, b: DiagnosticLog) =>
  a.stamp.sec - b.stamp.sec || a.stamp.nanosec - b.stamp.nanosec;

export const LogPanel: React.FC<LogPanelProps> = ({ logs, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  // default: OK only
  const [selected, setSelected] = useState<Set<number>>(new Set([DiagnosticStatusLevel.OK]));
  const theme = useTheme();

const toggle = (level: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });

const visible = useMemo(
    () =>
      LEVELS.filter((l) => selected.has(l))
        .flatMap((l) => logs[l] ?? [])
        .sort(compareStamp),
    [logs, selected],
  );
const total = LEVELS.reduce((n, l) => n + (logs[l]?.length ?? 0), 0);

  return (
    <>
      <Box
        onClick={() => setIsOpen((prev) => !prev)}
        sx={{
          position: 'absolute',
          top: 80,
          right: isOpen ? 320 : 0,
          zIndex: 1100,
          backgroundColor: '#282c34',
          color: '#e2e8f0',
          padding: '10px 6px',
          borderRadius: '6px 0 0 6px',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          userSelect: 'none',
          fontSize: 13,
          letterSpacing: 1,
          fontFamily: theme.typography.fontFamily,
          transition: 'right 0.2s ease',
        }}
      >
        Log
      </Box>

      {isOpen && (
        <Box
          component={Paper}
          elevation={4}
          sx={{
            position: 'absolute',
            top: 64,
            right: 0,
            width: 320,
            height: 'calc(100% - 64px)',
            zIndex: 1050,
            overflowY: 'auto',
            padding: 2,
            backgroundColor: '#282c34',
            color: '#e2e8f0',
            fontFamily: theme.typography.fontFamily,
            fontSize: 10,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              LOTUSim Log
            </Typography>
            <Box
              onClick={onClear}
              sx={{
                cursor: total === 0 ? 'default' : 'pointer',
                opacity: total === 0 ? 0.4 : 1,
                pointerEvents: total === 0 ? 'none' : 'auto',
                px: 1,
                py: 0.25,
                fontSize: 11,
                borderRadius: 1,
                border: '1px solid #94a3b8',
                color: '#94a3b8',
                userSelect: 'none',
                '&:hover': { color: '#e2e8f0', borderColor: '#e2e8f0' },
              }}
            >
              Clear
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5}}>
            {LEVELS.map((level) => {
              const data = LEVEL_DATA[level];
              const active = selected.has(level);
              return (
                <Box
                  key={level}
                  onClick={() => toggle(level)}
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    px: 0.75,
                    py: 0.25,
                    fontSize: 11,
                    borderRadius: 1,
                    border: `1px solid ${data.color}`,
                    color: active ? '#282c34' : data.color,
                    backgroundColor: active ? data.color : 'transparent',
                    opacity: active ? 1 : 0.6,
                  }}
                >
                  {data.label} {logs[level]?.length ?? 0}
                </Box>
              );
            })}
          </Box>

          {visible.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {total === 0 ? 'No log messages yet' : 'No messages for the selected levels'}
            </Typography>
          ) : (
            visible.map((log, i) => {
              const data = LEVEL_DATA[log.status.level] ?? {
                label: String(log.status.level),
                color: '#e2e8f0',
              };
              return (
                <Box key={i} sx={{ whiteSpace: 'pre-wrap', marginBottom: '6px', lineHeight: 1.3, fontSize: 11 }}>
                  <Box component="span" sx={{ color: '#64748b', mr: 0.75 }}>
                    {formatStamp(log.stamp)}
                  </Box>
                  <Box component="span" sx={{ fontWeight: 'bold', color: data.color, mr: 0.75 }}>
                    {data.label}
                  </Box>
                  <Box component="span" sx={{ color: '#64748b'}}>
                    {log.status.name}
                  </Box>
                  <Box sx={{ color: '#fff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {log.status.message}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      )}
    </>
  );
};