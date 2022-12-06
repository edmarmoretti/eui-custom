/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { forwardRef, useContext, useMemo } from 'react';

import {
  EuiThemeContext,
  EuiModificationsContext,
  EuiColorModeContext,
  defaultComputedTheme,
} from './context';
import { getEuiDevProviderWarning } from './provider';
import {
  EuiThemeColorModeStandard,
  EuiThemeModifications,
  EuiThemeComputed,
} from './types';

const providerMessage = `\`EuiProvider\` is missing which can result in negative effects.
Wrap your component in \`EuiProvider\`: https://ela.st/euiprovider.`;

export interface UseEuiTheme<T extends {} = {}> {
  euiTheme: EuiThemeComputed<T>;
  colorMode: EuiThemeColorModeStandard;
  modifications: EuiThemeModifications<T>;
}

export const useEuiTheme = <T extends {} = {}>(): UseEuiTheme<T> => {
  const theme = useContext(EuiThemeContext);
  const colorMode = useContext(EuiColorModeContext);
  const modifications = useContext(EuiModificationsContext);

  const isFallback = theme === defaultComputedTheme;
  const warningLevel = getEuiDevProviderWarning();
  if (isFallback && typeof warningLevel !== 'undefined') {
    switch (warningLevel) {
      case 'log':
        console.log(providerMessage);
        break;
      case 'warn':
        console.warn(providerMessage);
        break;
      case 'error':
        throw new Error(providerMessage);
      default:
        break;
    }
  }

  const assembledTheme = useMemo(
    () => ({
      euiTheme: theme as EuiThemeComputed<T>,
      colorMode,
      modifications: modifications as EuiThemeModifications<T>,
    }),
    [theme, colorMode, modifications]
  );

  return assembledTheme;
};

export interface WithEuiThemeProps<P extends {} = {}> {
  theme: UseEuiTheme<P>;
}
// Provide the component props interface as the generic to allow the docs props table to populate.
// e.g., `const EuiComponent = withEuiTheme<EuiComponentProps>(_EuiComponent)`
export const withEuiTheme = <T extends {} = {}, U extends {} = {}>(
  Component: React.ComponentType<T & WithEuiThemeProps<U>>
) => {
  const componentName =
    Component.displayName || Component.name || 'ComponentWithTheme';
  const Render = (
    props: Omit<T, keyof WithEuiThemeProps<U>>,
    ref: React.Ref<Omit<T, keyof WithEuiThemeProps<U>>>
  ) => {
    const theme = useEuiTheme<U>();
    return <Component theme={theme} ref={ref} {...(props as T)} />;
  };

  const WithEuiTheme = forwardRef(Render);

  WithEuiTheme.displayName = componentName;

  return WithEuiTheme;
};
