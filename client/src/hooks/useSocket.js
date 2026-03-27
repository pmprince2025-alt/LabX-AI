import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  useEffect(() => {
    // Connect to the backend
    const serverUrl = `http://${window.location.hostname}:3005`;
    socketRef.current = io(serverUrl);

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setErrorStatus(null);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      setErrorStatus("Cannot connect to server.");
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  /**
   * Subscribes to backend events to update streaming UI
   */
  const bindEvents = useCallback((handlers) => {
    if (!socketRef.current) return;
    
    // Clear previous event listeners to avoid duplicates
    socketRef.current.off('query_acknowledged');
    socketRef.current.off('sources');
    socketRef.current.off('answer_chunk');
    socketRef.current.off('answer_done');
    socketRef.current.off('error');

    // Register new ones provided from App
    socketRef.current.on('query_acknowledged', handlers.onQueryAcknowledged);
    socketRef.current.on('sources', handlers.onSources);
    socketRef.current.on('answer_chunk', handlers.onAnswerChunk);
    socketRef.current.on('answer_done', handlers.onAnswerDone);
    socketRef.current.on('error', handlers.onError);
  }, []);

  const sendQuery = useCallback((query) => {
    if (socketRef.current) {
      socketRef.current.emit('send_query', { query });
    }
  }, []);

  return { isConnected, errorStatus, sendQuery, bindEvents };
};
