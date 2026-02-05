const firebaseConfig = {
  apiKey: "AIzaSyBUtjkdg5_BT9sLJD3POdOGj2AkADOxk4Q",
  authDomain: "podio-control.firebaseapp.com",
  projectId: "podio-control",
  storageBucket: "podio-control.firebasestorage.app",
  messagingSenderId: "462288410598",
  appId: "1:462288410598:web:113878fb307c5cfb9ea827"
};



// VARIÁVEIS GLOBAIS

let db;
let unsubscribe = null;


// INICIALIZAÇÃO DO FIREBASE

function initFirebase() {
    try {
        // Verificar se já foi inicializado
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }

        // Inicializar Firestore
        db = firebase.firestore();

        console.log('✅ Firebase Firestore inicializado com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        return false;
    }
}


function getPageStatusRef() {
    return db.collection('config').doc('pageStatus');
}

/**
 * Atualiza o status da página no Firestore
 * @param {Object} data 
 * @returns {Promise}
 */
async function updatePageStatus(data) {
    try {
        await getPageStatusRef().set({
            ...data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log('✅ Status atualizado no Firestore:', data);
        return true;
    } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
        throw error;
    }
}

/**
 * Obtém o status atual da página (uma vez)
 * @returns {Promise<Object>}
 */
async function getPageStatus() {
    try {
        const doc = await getPageStatusRef().get();
        if (doc.exists) {
            return doc.data();
        } else {
            console.warn('⚠️ Documento não encontrado, criando valores padrão...');
            const defaultData = {
                maintenance: false,
                mode: 'normal',
                message: 'Sistema operacional',
                title: ''
            };
            await updatePageStatus(defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error('❌ Erro ao obter status:', error);
        throw error;
    }
}

/**
 * @param {Function} callback - Função chamada quando há mudanças
 */
function listenToPageStatus(callback) {
   
    if (unsubscribe) {
        unsubscribe();
    }

    unsubscribe = getPageStatusRef().onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            console.log('📥 Dados recebidos do Firestore:', data);
            callback(data);
        } else {
            console.warn('⚠️ Documento não existe ainda');
            callback(null);
        }
    }, (error) => {
        console.error('❌ Erro no listener:', error);
    });
}


function stopListening() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
        console.log('🔇 Listener desconectado');
    }
}
