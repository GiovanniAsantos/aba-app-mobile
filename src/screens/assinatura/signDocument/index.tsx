import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input } from '@/components';
import ModalViewPdf from '@/components/modalViewPdf/ModalViewPdf';
import { useAuth } from '@/context/AuthProvider';
import { apiSignatureUrlV1 } from '@/config/api';
import { styles } from './style';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { DocumentToSign } from '@/types/signatureApi';

// Import condicional do expo-location (não funciona no Expo Go)
let Location: any = null;
try {
    // Verifica se está em um development build antes de importar
    const Constants = require('expo-constants').default;
    const isExpoGo = Constants.appOwnership === 'expo';
    
    if (!isExpoGo) {
        Location = require('expo-location');
    }
} catch (error) {
    Location = null;
}

type SignDocumentScreenRouteProp = RouteProp<RootStackParamList, 'SignDocument'>;
type SignDocumentScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'SignDocument'
>;

interface SignDocumentProps {
    route: SignDocumentScreenRouteProp;
    navigation: SignDocumentScreenNavigationProp;
}

// Estendendo o tipo DocumentToSign para incluir signaturePosition
interface DocumentWithPosition extends DocumentToSign {
    signaturePosition?: {
        x: number;
        y: number;
        width: number;
        height: number;
        page: number;
    };
}

export default function SignDocument({ route, navigation }: SignDocumentProps) {
    const { tokens } = useAuth();
    const { signatureId } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [documents, setDocuments] = useState<DocumentWithPosition[]>([]);
    const [currentDocIndex, setCurrentDocIndex] = useState(0);
    const [signatureTitle, setSignatureTitle] = useState('');
    const [linearId, setLinearId] = useState<string | null>(null);
    const [validationType, setValidationType] = useState<'POR_TOKEN' | 'POR_SENHA' | 'ICP_BRASIL'>('POR_TOKEN');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [signatureImgBase64, setSignatureImgBase64] = useState<string | null>(null);
    const [rubricImgBase64, setRubricImgBase64] = useState<string | null>(null);
    const [marcationSign, setMarcationSign] = useState<any>({
        base64: '',
        marcationSigns: [],
    });
    const [marcationRubric, setMarcationRubric] = useState<any>({
        base64: '',
        marcationRubrics: [],
    });
    const [mySignature, setMySignature] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loadingDoc, setLoadingDoc] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const currentDocument = documents[currentDocIndex];

    useEffect(() => {
        loadSignatureData();
    }, []);

    useEffect(() => {
        if (mySignature && documents.length > 0) {
            // Só busca assinatura se for OPTIONAL_SIGN ou REQUIRED_SIGN
            if (mySignature.marcationSign && mySignature.marcationSign !== 'NOT_SIGN') {
                getDefaultSignature();
            }
            // Só busca rubrica se for OPTIONAL_SIGN ou REQUIRED_SIGN
            if (mySignature.marcationRubric && mySignature.marcationRubric !== 'NOT_SIGN') {
                getDefaultRubric();
            }
        }
    }, [mySignature]);

    // Carrega o primeiro documento quando a lista de documentos é populada
    useEffect(() => {
        if (documents.length > 0 && !pdfUrl && !loadingDoc) {
            const firstDoc = documents[0];
            if (firstDoc && firstDoc.cloudDocumentUuid) {
                loadDocument(firstDoc);
            }
        }
    }, [documents]);

    // Carrega documento quando o índice muda
    useEffect(() => {
        if (documents.length > 0 && currentDocIndex >= 0) {
            const currentDoc = documents[currentDocIndex];
            if (currentDoc && currentDoc.cloudDocumentUuid) {
                loadDocument(currentDoc);
            }
        }
    }, [currentDocIndex]);

    const loadSignatureData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${apiSignatureUrlV1}/signatures/me/${signatureId}`,
                {
                    headers: {
                        Authorization: `Bearer ${tokens?.accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao carregar dados da assinatura');
            }

            const data = await response.json();
            const content = data.content || data;
        

            setSignatureTitle(content.title || 'Documento para Assinatura');
            setLinearId(content?.crdInfo?.linearId || null);

            // Mapear documentos corretamente
            const mappedDocs = (content.documentsToSign || []).map((doc: any) => ({
                id: doc.id?.toString() || '',
                cloudDocumentUuid: doc.cloudDocumentUuid || '',
                name: doc.name || '',
                url: doc.url || doc.path || '',
                marcationSigns: doc.marcationSigns || [],
                marcationRubrics: doc.marcationRubrics || [],
            }));

            setDocuments(mappedDocs);
            setMySignature(content.mySignature);
            setUser(content.mySignature);

            // Corrigir validação de tipo - aceitar POR_SENHA
            const typeValidation = content.mySignature?.typeValidation || 'POR_TOKEN';
            setValidationType(typeValidation);
        } catch (error) {
            console.error('Erro ao carregar assinatura:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados da assinatura');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const getDefaultSignature = async () => {
        try {
            const response = await fetch(
                `${apiSignatureUrlV1}/marcations-signs/me`,
                {
                    headers: {
                        Authorization: `Bearer ${tokens?.accessToken}`,
                    },
                }
            );

            if (!response.ok) return;

            const data = await response.json();

            if (data?.status === 2000 && data?.content !== null) {
                setSignatureImgBase64(data?.content?.base64);

                let tempMarcationSignInfo: any[] = [];

                const updatedDocuments = documents.map((doc: any) => {
                    const signsForDoc =
                        doc.marcationSigns?.filter(
                            (m: any) => m.participant?.cpf === user?.numberDocument
                        ) || [];

                    doc.marcationSigns = signsForDoc.map((marcation: any) => {
                        tempMarcationSignInfo.push({
                            id: marcation?.id,
                            docToSignUuid: doc.cloudDocumentUuid,
                            height: marcation.height,
                            width: marcation.width,
                            numberPage: marcation.numberPage,
                            positionX: marcation.positionX,
                            positionY: marcation.positionY,
                            signType: 'DESIGN',
                            withDescription: data?.content?.withDescription,
                        });

                        return {
                            ...marcation,
                            signType: 'DESIGN',
                            withDescription: data?.content?.withDescription,
                        };
                    });

                    return doc;
                });

                const tempMacationSign = {
                    base64: data?.content?.base64,
                    marcationSigns: tempMarcationSignInfo,
                };

                setMarcationSign(tempMacationSign);
                setDocuments(updatedDocuments);
            }
        } catch (error) {
            console.error('Erro ao buscar assinatura padrão:', error);
        }
    };

    const getDefaultRubric = async () => {
        try {
            const response = await fetch(
                `${apiSignatureUrlV1}/marcations-rubrics/me`,
                {
                    headers: {
                        Authorization: `Bearer ${tokens?.accessToken}`,
                    },
                }
            );

            if (!response.ok) return;

            const data = await response.json();

            if (data?.status === 2000 && data?.content !== null) {
                setRubricImgBase64(data?.content?.base64);

                let tempMarcationRubricInfo: any[] = [];

                const updatedDocuments = documents.map((doc: any) => {
                    const rubricsForDoc =
                        doc.marcationRubrics?.filter(
                            (m: any) => m.participant?.cpf === user?.numberDocument
                        ) || [];

                    doc.marcationRubrics = rubricsForDoc.map((marcation: any) => {
                        tempMarcationRubricInfo.push({
                            id: marcation?.id,
                            docToSignUuid: doc.cloudDocumentUuid,
                            height: marcation.height,
                            width: marcation.width,
                            numberPage: marcation.numberPage,
                            positionX: marcation.positionX,
                            positionY: marcation.positionY,
                            signType: 'DESIGN',
                            allPages: marcation.allPages,
                        });

                        return {
                            ...marcation,
                            signType: 'DESIGN',
                        };
                    });

                    return doc;
                });

                const tempMacationRubric = {
                    base64: data?.content?.base64,
                    marcationRubrics: tempMarcationRubricInfo,
                };

                setMarcationRubric(tempMacationRubric);
                setDocuments(updatedDocuments);
            }
        } catch (error) {
            console.error('Erro ao buscar rubrica padrão:', error);
        }
    };

    // Função para obter IP público
    const getPublicIP = async (): Promise<string> => {
        try {
            // Tentar primeiro serviço
            const response = await fetch('https://api.ipify.org?format=json', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.ip || '';
            }
            
            // Fallback para segundo serviço
            const response2 = await fetch('https://api64.ipify.org?format=json');
            if (response2.ok) {
                const data2 = await response2.json();
                return data2.ip || '';
            }
            
            return '';
        } catch (error) {
            console.error('Erro ao obter IP:', error);
            // Em caso de erro, retornar string vazia
            return '';
        }
    };

    const loadDocument = async (doc: any) => {
        if (!doc || !signatureId) {
            return;
        }

        // Se já está carregando o mesmo documento, não faz nada
        if (loadingDoc) {
            return;
        }

        // Limpa o PDF anterior e inicia carregamento
        setPdfUrl(null);
        setLoadingDoc(true);

        try {
            const response = await fetch(
                `${apiSignatureUrlV1}/documents/${signatureId}/signature-id/${doc.cloudDocumentUuid}/doc-key`,
                {
                    headers: {
                        Authorization: `Bearer ${tokens?.accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao carregar documento: ${response.status}`);
            }

            // Pegar o arrayBuffer e converter para base64
            const arrayBuffer = await response.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            const base64data = `data:application/pdf;base64,${base64}`;

            setPdfUrl(base64data);

        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar o documento. Verifique sua conexão.');
            setPdfUrl(null);
        } finally {
            setLoadingDoc(false);
        }
    };



    const handleSign = async () => {
        if (validationType === 'POR_TOKEN' && !token) {
            Alert.alert('Atenção', 'Por favor, insira o código de validação');
            return;
        }

        if (validationType === 'POR_SENHA' && !password) {
            Alert.alert('Atenção', 'Por favor, insira sua senha');
            return;
        }

        if (validationType === 'ICP_BRASIL' && !password) {
            Alert.alert('Atenção', 'Por favor, insira a senha do certificado');
            return;
        }

        // Solicitar permissões e capturar localização e IP
        setLoadingLocation(true);
        let latitude = '';
        let longitude = '';
        let ip = '';

        try {
            // Verificar se expo-location está disponível
            if (!Location) {
                // Expo Go ou módulo não disponível - usar coordenadas de teste
                const shouldContinue = await new Promise<boolean>((resolve) => {
                    Alert.alert(
                        'Expo Go Detectado',
                        'A localização não está disponível no Expo Go.\n\n' +
                        'Para usar localização real, use:\n' +
                        'npx expo run:android (ou run:ios)\n\n' +
                        'Deseja continuar com coordenadas de teste?',
                        [
                            { 
                                text: 'Cancelar', 
                                style: 'cancel',
                                onPress: () => resolve(false)
                            },
                            {
                                text: 'Usar Coordenadas de Teste',
                                onPress: () => {
                                    latitude = '-23.5505';
                                    longitude = '-46.6333';
                                    resolve(true);
                                },
                            },
                        ]
                    );
                });

                if (!shouldContinue || !latitude || !longitude) {
                    setLoadingLocation(false);
                    return;
                }
            } else {
                // Solicitar permissão de localização
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLoadingLocation(false);
                    Alert.alert(
                        'Permissão Necessária',
                        'É necessário permitir o acesso à localização para assinar documentos.',
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                                text: 'Tentar Novamente',
                                onPress: () => handleSign(),
                            },
                        ]
                    );
                    return;
                }

                // Capturar localização APÓS permissão concedida
                try {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                        timeout: 10000, // 10 segundos
                    });
                    latitude = location.coords.latitude.toString();
                    longitude = location.coords.longitude.toString();
                } catch (locationError) {
                    // Oferecer coordenadas de fallback
                    const shouldContinue = await new Promise<boolean>((resolve) => {
                        Alert.alert(
                            'Localização Indisponível',
                            'Não foi possível obter sua localização. Isso pode acontecer em emuladores.\n\n' +
                            'Para Android: Abra Extended Controls (⋮) > Location\n' +
                            'Para iOS: Debug > Location > Custom Location\n\n' +
                            'Deseja continuar com coordenadas padrão (apenas para testes)?',
                            [
                                { 
                                    text: 'Cancelar', 
                                    style: 'cancel',
                                    onPress: () => resolve(false)
                                },
                                {
                                    text: 'Usar Coordenadas Padrão',
                                    onPress: () => {
                                        latitude = '-23.5505';
                                        longitude = '-46.6333';
                                        resolve(true);
                                    },
                                },
                            ]
                        );
                    });

                    if (!shouldContinue || !latitude || !longitude) {
                        setLoadingLocation(false);
                        return;
                    }
                }
            }

            // Validar que temos coordenadas válidas
            if (!latitude || !longitude) {
                setLoadingLocation(false);
                Alert.alert('Erro', 'Não foi possível obter as coordenadas. Tente novamente.');
                return;
            }

            // Solicitar permissão para enviar IP
            const shouldSendIP = await new Promise<boolean>((resolve) => {
                Alert.alert(
                    'Permissão de Rede',
                    'Para garantir a segurança da assinatura, precisamos coletar seu endereço IP de rede.\n\n' +
                    'Essas informações serão usadas apenas para validação da assinatura.\n\n' +
                    'Deseja permitir o envio do seu IP?',
                    [
                        {
                            text: 'Não Permitir',
                            style: 'cancel',
                            onPress: () => resolve(false),
                        },
                        {
                            text: 'Permitir',
                            onPress: () => resolve(true),
                        },
                    ]
                );
            });

            if (!shouldSendIP) {
                setLoadingLocation(false);
                return;
            }

            // Obter IP público
            ip = await getPublicIP();
            
            if (!ip) {
                // Perguntar se deseja continuar sem IP
                const shouldContinueWithoutIP = await new Promise<boolean>((resolve) => {
                    Alert.alert(
                        'IP Não Disponível',
                        'Não foi possível obter seu endereço IP. Isso pode acontecer por problemas de conectividade.\n\n' +
                        'Deseja continuar a assinatura sem o IP?',
                        [
                            {
                                text: 'Cancelar',
                                style: 'cancel',
                                onPress: () => resolve(false),
                            },
                            {
                                text: 'Continuar',
                                onPress: () => resolve(true),
                            },
                        ]
                    );
                });

                if (!shouldContinueWithoutIP) {
                    setLoadingLocation(false);
                    return;
                }
            }

        } catch (error) {
            setLoadingLocation(false);
            Alert.alert('Erro', 'Não foi possível obter os dados necessários para assinatura');
            return;
        } finally {
            setLoadingLocation(false);
        }

        // Confirmar assinatura
        Alert.alert(
            'Confirmar Assinatura',
            `Deseja assinar este documento?\n\nLocalização: ${latitude.substring(0, 8)}, ${longitude.substring(0, 8)}` +
            (ip ? `\nIP: ${ip}` : ''),
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Assinar',
                    onPress: async () => {
                        setSigning(true);
                        try {
                            let endpoint = '';
                            let requestBody: any = {};

                            // Estrutura comum para todos os tipos
                            const signaturePayload = {
                                canvasBase64: '',
                                ip: ip,
                                latitude: latitude,
                                longitude: longitude,
                                tipoValidacao: validationType,
                            };

                            if (validationType === 'POR_TOKEN') {
                                endpoint = `${apiSignatureUrlV1}/signatures/participants/sign-by-token`;
                                requestBody = {
                                    token: token,
                                    linearId: linearId,
                                    marcationRubric: marcationRubric,
                                    marcationSign: marcationSign,
                                    signature: signaturePayload,
                                };
                            } else if (validationType === 'POR_SENHA') {
                                endpoint = `${apiSignatureUrlV1}/signatures/participants/sign-by-password`;
                                requestBody = {
                                    password: password,
                                    linearId: linearId,
                                    marcationRubric: marcationRubric,
                                    marcationSign: marcationSign,
                                    signature: signaturePayload,
                                };
                            } else if (validationType === 'ICP_BRASIL') {
                                endpoint = `${apiSignatureUrlV1}/signatures/participants/sign-by-icp`;
                                requestBody = {
                                    certificatePassword: password,
                                    linearId: linearId,
                                    marcationRubric: marcationRubric,
                                    marcationSign: marcationSign,
                                    signature: signaturePayload,
                                };
                            }

                            const response = await fetch(endpoint, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${tokens?.accessToken}`,
                                },
                                body: JSON.stringify(requestBody),
                            });

                            if (!response.ok) {
                                const errorData = await response.json().catch(() => ({}));
                                throw new Error(errorData.message || `Erro ao assinar documento: ${response.status}`);
                            }

                            Alert.alert(
                                'Sucesso',
                                'Documento assinado com sucesso!',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => navigation.goBack(),
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error('Erro ao assinar:', error);
                            Alert.alert('Erro', 'Não foi possível assinar o documento');
                        } finally {
                            setSigning(false);
                        }
                    },
                },
            ]
        );
    };

    const handleRequestToken = async () => {
        try {
            const response = await fetch(
                `${apiSignatureUrlV1}/signatures/${signatureId}/request-token`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${tokens?.accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao solicitar token');
            }

            Alert.alert('Sucesso', 'Token enviado para seu e-mail');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível enviar o token');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F6AF5" />
                <Text style={styles.loadingText}>Carregando documento...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{signatureTitle}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Document Viewer */}
            <View style={styles.documentSection}>
                <View style={styles.documentHeader}>
                    <Text style={styles.documentTitle}>
                        {currentDocument?.name || 'Documento'}
                    </Text>
                    <Text style={styles.documentInfo}>
                        {currentDocIndex + 1} de {documents.length}
                    </Text>
                </View>

                <View style={styles.documentPreview}>
                    {loading ? (
                        <View style={styles.documentPlaceholder}>
                            <ActivityIndicator size="large" color="#4F6AF5" />
                            <Text style={styles.placeholderText}>
                                Carregando assinatura...
                            </Text>
                        </View>
                    ) : loadingDoc ? (
                        <View style={styles.documentPlaceholder}>
                            <ActivityIndicator size="large" color="#4F6AF5" />
                            <Text style={styles.placeholderText}>
                                Carregando documento...
                            </Text>
                        </View>
                    ) : pdfUrl ? (
                        <View style={styles.documentPlaceholder}>
                            <MaterialCommunityIcons name="file-pdf-box" size={80} color="#4F6AF5" />
                            <Text style={styles.placeholderText}>
                                {currentDocument?.name}
                            </Text>
                            <TouchableOpacity
                                style={styles.viewButton}
                                onPress={() => setShowPdfModal(true)}
                            >
                                <MaterialCommunityIcons name="eye" size={20} color="#fff" />
                                <Text style={styles.viewButtonText}>Visualizar Documento</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.documentPlaceholder}>
                            <MaterialCommunityIcons name="file-document" size={80} color="#ccc" />
                            <Text style={styles.placeholderText}>
                                Nenhum documento carregado
                            </Text>
                        </View>
                    )}
                </View>

                {/* Document Navigation */}
                {documents.length > 1 && (
                    <View style={styles.documentNavigation}>
                        <TouchableOpacity
                            style={[styles.navButton, currentDocIndex === 0 && styles.navButtonDisabled]}
                            onPress={() => setCurrentDocIndex(currentDocIndex - 1)}
                            disabled={currentDocIndex === 0}
                        >
                            <MaterialCommunityIcons
                                name="chevron-left"
                                size={24}
                                color={currentDocIndex === 0 ? '#ccc' : '#4F6AF5'}
                            />
                            <Text style={[styles.navButtonText, currentDocIndex === 0 && styles.navButtonTextDisabled]}>
                                Anterior
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.navButton,
                                currentDocIndex === documents.length - 1 && styles.navButtonDisabled,
                            ]}
                            onPress={() => setCurrentDocIndex(currentDocIndex + 1)}
                            disabled={currentDocIndex === documents.length - 1}
                        >
                            <Text
                                style={[
                                    styles.navButtonText,
                                    currentDocIndex === documents.length - 1 && styles.navButtonTextDisabled,
                                ]}
                            >
                                Próximo
                            </Text>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={24}
                                color={currentDocIndex === documents.length - 1 ? '#ccc' : '#4F6AF5'}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Validation Section */}
            <View style={styles.validationSection}>
                <Text style={styles.sectionTitle}>Validação</Text>

                {validationType === 'POR_TOKEN' && (
                    <View>
                        <Text style={styles.validationInfo}>
                            Um código de validação foi enviado para seu e-mail
                        </Text>
                        <Input
                            label="Código de Validação"
                            value={token}
                            onChangeText={setToken}
                            placeholder="Digite o código recebido"
                            keyboardType="number-pad"
                        />
                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleRequestToken}
                        >
                            <MaterialCommunityIcons name="email-outline" size={20} color="#4F6AF5" />
                            <Text style={styles.resendButtonText}>Reenviar código</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {validationType === 'POR_SENHA' && (
                    <View>
                        <Text style={styles.validationInfo}>
                            Digite sua senha de usuário para confirmar a assinatura
                        </Text>
                        <Input
                            label="Senha"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Digite sua senha"
                            secureTextEntry
                        />
                    </View>
                )}

                {validationType === 'ICP_BRASIL' && (
                    <View>
                        <Text style={styles.validationInfo}>
                            Insira a senha do seu certificado digital ICP-Brasil
                        </Text>
                        <Input
                            label="Senha do Certificado"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Digite a senha do certificado"
                            secureTextEntry
                        />
                    </View>
                )}
            </View>

            {/* Sign Button */}
            <View style={styles.signSection}>
                <Button
                    title={
                        loadingLocation 
                            ? 'Obtendo localização e IP...' 
                            : signing 
                            ? 'Assinando...' 
                            : 'Assinar Documento'
                    }
                    onPress={handleSign}
                    variant="primary"
                    disabled={
                        signing ||
                        loadingLocation ||
                        (validationType === 'POR_TOKEN' && !token) ||
                        (validationType === 'POR_SENHA' && !password) ||
                        (validationType === 'ICP_BRASIL' && !password)
                    }
                />
                {(signing || loadingLocation) && (
                    <ActivityIndicator
                        size="small"
                        color="#4F6AF5"
                        style={{ marginTop: 12 }}
                    />
                )}
            </View>

            {/* Modal de Visualização de PDF */}
            {pdfUrl && (
                <ModalViewPdf
                    visible={showPdfModal}
                    onClose={() => setShowPdfModal(false)}
                    pdfUrl={pdfUrl}
                    fileName={currentDocument?.name || 'documento.pdf'}
                />
            )}
        </ScrollView>
    );
}
