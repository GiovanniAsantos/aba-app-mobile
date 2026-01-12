import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { SignatureApiResponse } from '@/types/signatureApi';
import { Button } from '@/components';
import ModalViewPdf from '@/components/modalViewPdf/ModalViewPdf';
import { useAuth } from '@/context/AuthProvider';
import { apiSignatureUrlV1 } from '@/config/api';
import { styles } from './style';

type SeeSignatureScreenRouteProp = RouteProp<RootStackParamList, 'Signature'>;
type SeeSignatureScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Signature'
>;

interface SeeSignatureProps {
    route: SeeSignatureScreenRouteProp;
    navigation: SeeSignatureScreenNavigationProp;
}

interface Participant {
    id: string;
    name: string;
    email: string;
    cpf: string;
    status: string;
    titleParticipant: string;
    typeValidation?: string;
    signedAt?: string;
    sequence?: number;
}

interface Document {
    id: string;
    cloudDocumentUuid: string;
    name: string;
    url?: string;
    urlSigned?: string;
}

interface BlockchainEvent {
    id: string;
    event: string;
    timestamp: string;
    transactionHash?: string;
    description: string;
}

interface SignatureData {
    id: string;
    linearId: string;
    title: string;
    description?: string;
    status: string;
    createdAt: string;
    createdBy: string;
    documents: Document[];
    participants: Participant[];
    groups: Array<{
        sequence: number;
        ruleId: number | null;
        participants: Participant[];
    }>;
    blockchainEvents?: BlockchainEvent[];
    signedDocuments?: Array<{
        id: number;
        documentId: number;
        participantId: number;
        signedAt: string;
        urlSigned: string;
        cloudDocumentUuid?: string;
        docOrigin?: {
            cloudDocumentUuid: string;
        };
    }>;
    crdInfo?: {
        status: string;
        linearId: string;
    };
    currentUserParticipant?: Participant;
    canSign: boolean;
    canCancel: boolean;
}

export default function SeeSignature({ route, navigation }: SeeSignatureProps) {
    const { tokens } = useAuth();
    const { signatureId } = route.params;

    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
    const [showBlockchain, setShowBlockchain] = useState(false);
    const [canceling, setCanceling] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
    const [currentPdfName, setCurrentPdfName] = useState<string>('');
    const [loadingPdf, setLoadingPdf] = useState(false);

    useEffect(() => {
        loadSignatureData();
    }, [signatureId]);

    const loadSignatureData = async () => {
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
                throw new Error('Erro ao carregar assinatura');
            }

            const data: SignatureApiResponse = await response.json();

            // API retorna dados dentro de content
            const signatureContent = data.content;

            // Adaptar estrutura para o formato esperado
            const adaptedData: SignatureData = {
                id: signatureContent.id?.toString() || '',
                linearId: signatureContent.crdInfo?.linearId || '',
                title: signatureContent.title || 'Sem título',
                description: '',
                status: signatureContent.status || '',
                createdAt: signatureContent.createdAt || '',
                createdBy: signatureContent.createdBy || '',
                documents: (signatureContent.documentsToSign || []).map((doc) => ({
                    id: doc.id?.toString() || '',
                    cloudDocumentUuid: doc.cloudDocumentUuid || '',
                    name: doc.name || 'Documento sem nome',
                    url: doc.url || doc.path || '',
                    urlSigned: doc.urlSigned || '',
                })),
                participants: [],
                groups: (signatureContent.groups || []).map((group) => ({
                    sequence: group.sequence || 1,
                    ruleId: group.ruleId || null,
                    participants: (group.participants || []).map((p) => ({
                        id: p.id?.toString() || '',
                        name: p.name || '',
                        email: p.email || '',
                        cpf: p.numberDocument || '',
                        status: p.signatureParticipantStatus || '',
                        titleParticipant: p.titleParticipant || '',
                        typeValidation: p.typeValidation || '',
                        signedAt: p.signedAt,
                        sequence: group.sequence || 1,
                    })),
                })),
                blockchainEvents: (signatureContent.states || []).map((state) => ({
                    id: state.seq?.toString() || state.createdAt || '',
                    event: state.status || '',
                    timestamp: state.createdAt || '',
                    transactionHash: state.transactionId,
                    description: state.log || '',
                })),
                signedDocuments: signatureContent.signedDocuments || [],
                crdInfo: signatureContent.crdInfo,
                currentUserParticipant: signatureContent.mySignature ? {
                    id: signatureContent.mySignature.id?.toString() || '',
                    name: signatureContent.mySignature.name || '',
                    email: signatureContent.mySignature.email || '',
                    cpf: signatureContent.mySignature.numberDocument || '',
                    status: signatureContent.mySignature.signatureParticipantStatus || '',
                    titleParticipant: signatureContent.mySignature.titleParticipant || '',
                    typeValidation: signatureContent.mySignature.typeValidation || '',
                    signedAt: signatureContent.mySignature.signedAt,
                    sequence: 1,
                } : undefined,
                canSign: signatureContent.mySignature?.canSign || false,
                canCancel: true,
            };

            setSignatureData(adaptedData);
        } catch (error) {
            console.error('Erro ao carregar assinatura:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados da assinatura');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CONCLUIDO':
            case 'ASSINADO_POR_TODOS':
            case 'FINALIZADO':
                return { bg: '#d4edda', color: '#155724', icon: 'check-circle', label: 'Concluído' };
            case 'EM_ESPERA':
            case 'ATIVADO_AGUARDANDO_ASSINATURAS':
                return { bg: '#fff3cd', color: '#856404', icon: 'clock-outline', label: 'Aguardando' };
            case 'CANCELADO':
                return { bg: '#f8d7da', color: '#721c24', icon: 'close-circle', label: 'Cancelado' };
            case 'ASSINADO_PARCIALMENTE':
                return { bg: '#d1ecf1', color: '#0c5460', icon: 'progress-check', label: 'Em Andamento' };
            default:
                return { bg: '#e2e3e5', color: '#383d41', icon: 'information', label: 'Processando' };
        }
    };

    const getTitleParticipantText = (titleParticipant: string) => {
        switch (titleParticipant) {
            case 'SIGNATARIO':
                return 'Signatário';
            case 'OBSERVER':
                return 'Observador';
            case 'APPROVER':
                return 'Aprovador';
            default:
                return titleParticipant;
        }
    };

    const getValidationText = (typeValidation?: string) => {
        switch (typeValidation) {
            case 'POR_TOKEN':
                return 'Token E-mail';
            case 'POR_SENHA':
                return 'Senha';
            case 'ICP_BRASIL':
                return 'ICP-Brasil';
            default:
                return '';
        }
    };

    const handleViewDocument = async (doc: Document) => {
        await loadPdfDocument(doc);
    };

    const loadPdfDocument = async (doc: Document, isSignedDoc: boolean = false) => {
        if (!signatureData?.id) {
            Alert.alert('Erro', 'ID da assinatura não encontrado');
            return;
        }

        setLoadingPdf(true);
        try {
            let cloudUuid = doc.cloudDocumentUuid;

            // Se for documento assinado, buscar o UUID do documento assinado
            if (isSignedDoc && signatureData.signedDocuments) {
                const signedDoc = signatureData.signedDocuments.find(
                    (signed) => signed.docOrigin?.cloudDocumentUuid === doc.cloudDocumentUuid
                );

                if (signedDoc && signedDoc.cloudDocumentUuid) {
                    cloudUuid = signedDoc.cloudDocumentUuid;
                } else {
                    Alert.alert('Erro', 'Documento assinado não encontrado');
                    setLoadingPdf(false);
                    return;
                }
            }

            if (!cloudUuid) {
                throw new Error('UUID do documento não encontrado');
            }

            const endpoint = `${apiSignatureUrlV1}/documents/${signatureData.id}/signature-id/${cloudUuid}/doc-key`;

            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${tokens?.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar documento');
            }

            const arrayBuffer = await response.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            const base64data = `data:application/pdf;base64,${base64}`;

            setCurrentPdfUrl(base64data);
            setCurrentPdfName(doc.name);
            setShowPdfModal(true);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar o documento');
        } finally {
            setLoadingPdf(false);
        }
    };

    const handleDownloadOriginal = async (doc: Document) => {
        await loadPdfDocument(doc, false);
    };

    const handleDownloadSigned = async (doc: Document) => {
        await loadPdfDocument(doc, true); // Usar ZIP para documentos assinados
    };

    const handleSign = () => {
        if (!signatureData?.canSign) {
            Alert.alert('Aviso', 'Você não pode assinar este documento no momento');
            return;
        }
        navigation.navigate('SignDocument', { signatureId });
    };

    const handleCancelSignature = () => {
        Alert.alert(
            'Cancelar Assinatura',
            'Tem certeza que deseja cancelar esta assinatura? Esta ação não pode ser desfeita.',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim, Cancelar',
                    style: 'destructive',
                    onPress: confirmCancelSignature,
                },
            ]
        );
    };

    const confirmCancelSignature = async () => {
        setCanceling(true);
        const body = {
            linearId: signatureData?.linearId
        }
        try {
            const response = await fetch(
                `${apiSignatureUrlV1}/signatures/me/cancel`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${tokens?.accessToken}`,
                    },
                    body: JSON.stringify(body),
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao cancelar assinatura');
            }

            Alert.alert('Sucesso', 'Assinatura cancelada com sucesso', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.goBack();
                    },
                },
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível cancelar a assinatura');
        } finally {
            setCanceling(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F6AF5" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    if (!signatureData) {
        return (
            <View style={styles.loadingContainer}>
                <MaterialCommunityIcons name="alert-circle" size={64} color="#f44336" />
                <Text style={styles.errorText}>Assinatura não encontrada</Text>
                <Button title="Voltar" onPress={() => navigation.goBack()} variant="secondary" />
            </View>
        );
    }

    const statusStyle = getStatusStyle(signatureData.status);
    const allParticipants = signatureData.groups?.flatMap(g => g.participants) || signatureData.participants || [];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Assinatura</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Título e Status */}
            <View style={styles.card}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{signatureData.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <MaterialCommunityIcons
                            name={statusStyle.icon as any}
                            size={16}
                            color={statusStyle.color}
                        />
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>

                {signatureData.description && (
                    <Text style={styles.description}>{signatureData.description}</Text>
                )}

                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="calendar" size={18} color="#666" />
                    <Text style={styles.infoText}>
                        {new Date(signatureData.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="account" size={18} color="#666" />
                    <Text style={styles.infoText}>{signatureData.createdBy}</Text>
                </View>
            </View>

            {/* Documentos */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                    <MaterialCommunityIcons name="file-document-multiple" size={20} color="#1a1a1a" />
                    {'  '}Documentos ({signatureData.documents?.length})
                </Text>

                {signatureData.documents?.map((doc) => (
                    <View key={doc.id} style={styles.documentCard}>
                        <MaterialCommunityIcons name="file-pdf-box" size={40} color="#f44336" />
                        <View style={styles.documentInfo}>
                            <Text style={styles.documentName}>{doc.name}</Text>
                            <View style={styles.documentActions}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleViewDocument(doc)}
                                    disabled={loadingPdf}
                                >
                                    {loadingPdf ? (
                                        <ActivityIndicator size="small" color="#4F6AF5" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="eye" size={18} color="#4F6AF5" />
                                            <Text style={styles.actionButtonText}>Ver</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleDownloadOriginal(doc)}
                                    disabled={loadingPdf}
                                >
                                    {loadingPdf ? (
                                        <ActivityIndicator size="small" color="#4F6AF5" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="eye" size={18} color="#4F6AF5" />
                                            <Text style={styles.actionButtonText}>Original</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {signatureData.status === 'FINALIZADO' && (
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleDownloadSigned(doc)}
                                        disabled={loadingPdf}
                                    >
                                        {loadingPdf ? (
                                            <ActivityIndicator size="small" color="#28a745" />
                                        ) : (
                                            <>
                                                <MaterialCommunityIcons name="eye" size={18} color="#28a745" />
                                                <Text style={[styles.actionButtonText, { color: '#28a745' }]}>
                                                    Assinado
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Participantes */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                    <MaterialCommunityIcons name="account-group" size={20} color="#1a1a1a" />
                    {'  '}Participantes ({allParticipants?.length})
                </Text>

                {allParticipants.map((participant, index) => {
                    const participantStatus = getStatusStyle(participant.status);
                    return (
                        <View key={`participant-${participant.id}-${index}`} style={styles.participantCard}>
                            <View style={styles.participantHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.participantName}>{participant.name}</Text>
                                    <Text style={styles.participantEmail}>{participant.email}</Text>
                                </View>
                                <View
                                    style={[
                                        styles.participantStatusBadge,
                                        { backgroundColor: participantStatus.bg },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={participantStatus.icon as any}
                                        size={14}
                                        color={participantStatus.color}
                                    />
                                    <Text
                                        style={[
                                            styles.participantStatusText,
                                            { color: participantStatus.color },
                                        ]}
                                    >
                                        {participantStatus.label}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.participantDetails}>
                                <View style={styles.participantDetailItem}>
                                    <MaterialCommunityIcons name="badge-account" size={16} color="#666" />
                                    <Text style={styles.participantDetailText}>
                                        {getTitleParticipantText(participant.titleParticipant)}
                                    </Text>
                                </View>

                                {participant.typeValidation && (
                                    <View style={styles.participantDetailItem}>
                                        <MaterialCommunityIcons name="shield-check" size={16} color="#666" />
                                        <Text style={styles.participantDetailText}>
                                            {getValidationText(participant.typeValidation)}
                                        </Text>
                                    </View>
                                )}

                                {participant.signedAt && (
                                    <View style={styles.participantDetailItem}>
                                        <MaterialCommunityIcons name="calendar-check" size={16} color="#666" />
                                        <Text style={styles.participantDetailText}>
                                            {new Date(participant.signedAt).toLocaleDateString('pt-BR')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Blockchain Info */}
            {signatureData.crdInfo && (
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.blockchainHeader}
                        onPress={() => setShowBlockchain(!showBlockchain)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialCommunityIcons name="cube-outline" size={20} color="#4F6AF5" />
                            <Text style={styles.sectionTitle}>Blockchain</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={showBlockchain ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>

                    {showBlockchain && (
                        <View style={styles.blockchainContent}>
                            <View style={styles.blockchainItem}>
                                <Text style={styles.blockchainLabel}>Status:</Text>
                                <Text style={styles.blockchainValue}>{signatureData.crdInfo.status}</Text>
                            </View>
                            <View style={styles.blockchainItem}>
                                <Text style={styles.blockchainLabel}>Linear ID:</Text>
                                <Text style={[styles.blockchainValue, styles.monoFont]}>
                                    {signatureData.crdInfo.linearId}
                                </Text>
                            </View>

                            {signatureData.blockchainEvents && signatureData.blockchainEvents?.length > 0 && (
                                <View style={{ marginTop: 16 }}>
                                    <Text style={styles.blockchainSubtitle}>Eventos ({signatureData.blockchainEvents.length}):</Text>
                                    {signatureData.blockchainEvents.map((event, eventIndex) => (
                                        <View key={`event-${event.id}-${eventIndex}`} style={styles.eventCard}>
                                            <View style={styles.eventDot} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.eventName}>{event.event}</Text>
                                                <Text style={styles.eventDescription}>{event.description}</Text>
                                                <Text style={styles.eventTime}>
                                                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                                                </Text>
                                                {event.transactionHash && (
                                                    <Text style={[styles.eventHash, styles.monoFont]}>
                                                        TX: {event.transactionHash.substring(0, 16)}...
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            )}

            {/* Ações */}
            <View style={styles.actionsContainer}>
                {signatureData.canSign && (
                    <Button
                        title="Assinar Documento"
                        onPress={handleSign}
                        variant="primary"
                    />
                )}

                {signatureData.canCancel && (
                    <Button
                        title={canceling ? 'Cancelando...' : 'Cancelar Assinatura'}
                        onPress={handleCancelSignature}
                        variant="secondary"
                        disabled={canceling}
                    />
                )}

                <Button
                    title="Voltar"
                    onPress={() => navigation.goBack()}
                    variant="secondary"
                />
            </View>

            <View style={{ height: 40 }} />

            {/* Modal de Visualização de PDF */}
            {currentPdfUrl && (
                <ModalViewPdf
                    visible={showPdfModal}
                    onClose={() => {
                        setShowPdfModal(false);
                        setCurrentPdfUrl(null);
                        setCurrentPdfName('');
                    }}
                    pdfUrl={currentPdfUrl}
                    fileName={currentPdfName}
                />
            )}
        </ScrollView>
    );
}
