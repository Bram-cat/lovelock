import React, { createContext, useContext, useState, ReactNode } from 'react';
import Alert, { AlertProps, AlertAction } from '../components/ui/Alert';

interface AlertConfig {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  actions?: AlertAction[];
  autoClose?: boolean;
  duration?: number;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showConfirm: (
    title: string, 
    description?: string, 
    onConfirm?: () => void, 
    onCancel?: () => void
  ) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
    // Clear config after animation completes
    setTimeout(() => setAlertConfig(null), 200);
  };

  const showSuccess = (title: string, description?: string) => {
    showAlert({
      title,
      description,
      variant: 'success',
      autoClose: true,
      duration: 3000,
    });
  };

  const showError = (title: string, description?: string) => {
    showAlert({
      title,
      description,
      variant: 'destructive',
      autoClose: true,
      duration: 5000,
    });
  };

  const showWarning = (title: string, description?: string) => {
    showAlert({
      title,
      description,
      variant: 'warning',
      autoClose: true,
      duration: 4000,
    });
  };

  const showConfirm = (
    title: string,
    description?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      description,
      variant: 'default',
      autoClose: false,
      actions: [
        {
          label: 'Cancel',
          variant: 'outline',
          onPress: () => {
            onCancel?.();
            hideAlert();
          },
        },
        {
          label: 'Confirm',
          variant: 'default',
          onPress: () => {
            onConfirm?.();
            hideAlert();
          },
        },
      ],
    });
  };

  const contextValue: AlertContextType = {
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alertConfig && (
        <Alert
          {...alertConfig}
          visible={visible}
          onClose={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
}

// Global alert instance for use without hooks (similar to Alert.alert)
let globalAlertInstance: AlertContextType | null = null;

export const setGlobalAlertInstance = (instance: AlertContextType) => {
  globalAlertInstance = instance;
};

export const GlobalAlert = {
  show: (config: AlertConfig) => {
    if (globalAlertInstance) {
      globalAlertInstance.showAlert(config);
    } else {
      console.warn('GlobalAlert not initialized. Make sure AlertProvider is set up.');
    }
  },
  success: (title: string, description?: string) => {
    if (globalAlertInstance) {
      globalAlertInstance.showSuccess(title, description);
    }
  },
  error: (title: string, description?: string) => {
    if (globalAlertInstance) {
      globalAlertInstance.showError(title, description);
    }
  },
  warning: (title: string, description?: string) => {
    if (globalAlertInstance) {
      globalAlertInstance.showWarning(title, description);
    }
  },
  confirm: (
    title: string,
    description?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    if (globalAlertInstance) {
      globalAlertInstance.showConfirm(title, description, onConfirm, onCancel);
    }
  },
};