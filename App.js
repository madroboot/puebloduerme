import React, { useState } from 'react';
import { Player, GamePhase, Role, Screen } from './types.js';
import SetupScreen from './components/SetupScreen.js';
import RoleSelectionScreen from './components/RoleSelectionScreen.js';
import TutorialScreen from './components/TutorialScreen.js';
import LocalGameContainer from './components/LocalGameContainer.js';
import MainMenuScreen from './components/MainMenuScreen.js';
import OnlineGameContainer from './components/OnlineGameContainer.js';
import WelcomeScreen from './components/WelcomeScreen.js';


const App: React.FC = () => {
    const [screen, setScreen] = useState<Screen>('welcome');
    const [localGamePlayers, setLocalGamePlayers] = useState<string[]>([]);
    const [localGameRoles, setLocalGameRoles] = useState<Role[]>([]);
    
    const handleStartApp = () => {
        setScreen('main-menu');
    };

    const handleSelectMode = (mode: 'local' | 'online') => {
        if (mode === 'local') {
            setScreen('setup');
        } else {
            setScreen('online-lobby');
        }
    };

    const handleGoToRoleSelect = (playerNames: string[]) => {
        setLocalGamePlayers(playerNames);
        setScreen('roles');
    };
    
    const handleStartLocalGame = (roles: Role[]) => {
        setLocalGameRoles(roles);
        setScreen('game');
    };

    const handleBackToMainMenu = () => {
        setScreen('main-menu');
    };

    const handleBackToSetup = () => {
        setScreen('setup');
    };
    
    const handleGoToTutorial = () => {
        setScreen('tutorial');
    };

    const handleGoToHome = () => {
        setScreen('main-menu');
        setLocalGamePlayers([]);
        setLocalGameRoles([]);
    };

    switch (screen) {
        case 'welcome':
            return <WelcomeScreen onStart={handleStartApp} />;

        case 'main-menu':
            return <MainMenuScreen onSelectMode={handleSelectMode} onTutorial={handleGoToTutorial} />;
        
        case 'online-lobby':
            return <OnlineGameContainer onGoToHome={handleGoToHome} />;

        case 'setup':
            return <SetupScreen onContinue={handleGoToRoleSelect} initialPlayers={localGamePlayers} onBack={handleBackToMainMenu}/>;

        case 'tutorial':
            return <TutorialScreen onBack={handleBackToMainMenu} />;
        
        case 'roles':
            return <RoleSelectionScreen 
                        playerCount={localGamePlayers.length} 
                        onStartGame={handleStartLocalGame}
                        onBack={handleBackToSetup}
                    />;
        case 'game':
             return <LocalGameContainer 
                        playerNames={localGamePlayers}
                        roles={localGameRoles}
                        onGoToHome={handleGoToHome} 
                    />;

        default:
             return <WelcomeScreen onStart={handleStartApp} />;
    }
};

export default App;