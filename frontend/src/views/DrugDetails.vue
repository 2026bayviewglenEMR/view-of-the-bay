<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MainLayout from "../components/MainLayout.vue";
import { api } from "../api/api";

const route = useRoute();
const router = useRouter();

const drug = ref(null);
const loading = ref(true);
const interactionSearch = ref("");

const filteredInteractions = computed(() => {
    if (!drug.value?.drug_interactions) return [];

    const term = interactionSearch.value.trim().toLowerCase();

    if (!term) return drug.value.drug_interactions;

    return drug.value.drug_interactions.filter(interaction =>
        interaction.name?.toLowerCase().includes(term) ||
        interaction.drug_id?.toLowerCase().includes(term) ||
        interaction.description?.toLowerCase().includes(term)
    );
});

function openInteraction(interaction) {
    if (!interaction?.drug_id) return;

    router.push(`/drug-details/${interaction.drug_id}`);
}

async function loadDrugDetails() {
    loading.value = true;
    interactionSearch.value = "";

    try {
        const id = route.params.id;
        drug.value = await api.getDrugDetails(id);
    } catch (e) {
        console.log("Failed to load drug details:", e);
        drug.value = null;
    } finally {
        loading.value = false;
    }
}

onMounted(loadDrugDetails);

watch(
    () => route.params.id,
    () => {
        loadDrugDetails();
    }
);
</script>

<template>
    <MainLayout title="Drug Details">
        <div class="page">

            <div v-if="loading" class="status">
                Loading drug details...
            </div>

            <div v-else-if="!drug" class="status">
                Drug not found.
            </div>

            <div v-else>
                <button class="back-btn" @click="router.push('/drug-directory')">
                    ← Back to Drug Directory
                </button>

                <div class="drug-header">
                    <div class="drug-image-placeholder">
                        💊
                    </div>

                    <div>
                        <h2>{{ drug.name }}</h2>
                        <p class="id">{{ drug.id }}</p>
                    </div>
                </div>

                <div class="section-card">
                    <h3>Description</h3>
                    <p>{{ drug.description || "No description available." }}</p>
                </div>

                <div class="section-card">
                    <div class="interaction-header">
                        <h3>Drug Interactions</h3>

                        <span class="interaction-count">
                            {{ filteredInteractions.length }} results
                        </span>
                    </div>

                    <input v-model="interactionSearch" class="interaction-search"
                        placeholder="Search interactions..." />

                    <div v-if="filteredInteractions.length === 0" class="empty">
                        No interactions found.
                    </div>

                    <div v-else v-for="interaction in filteredInteractions" :key="interaction.drug_id"
                        class="interaction clickable" @click="openInteraction(interaction)">
                        <h4>{{ interaction.name }}</h4>
                        <p class="interaction-id">{{ interaction.drug_id }}</p>
                        <p>
                            {{ interaction.description || "No interaction description available." }}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </MainLayout>
</template>

<style scoped>
.page {
    padding: 10px;
}

.status {
    padding: 50px;
    text-align: center;
    color: #777;
}

.back-btn {
    margin-bottom: 18px;
    border: none;
    background: white;
    color: var(--color-primary);
    padding: 10px 16px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, .08);
}

.back-btn:hover {
    text-decoration: underline;
}

.drug-header {
    background: white;
    padding: 26px;
    border-radius: 18px;
    border-left: 6px solid var(--color-primary);
    box-shadow: 0 6px 20px rgba(0, 0, 0, .08);
    margin-bottom: 20px;

    display: flex;
    align-items: center;
    gap: 22px;
}

.drug-image-placeholder {
    width: 90px;
    height: 90px;
    min-width: 90px;

    background: #f3f7f5;
    border-radius: 18px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 44px;
}

h2 {
    margin: 0;
    color: var(--color-primary);
    overflow-wrap: anywhere;
    word-break: break-word;
}

.id {
    color: #777;
    margin-top: 8px;
}

.section-card {
    background: white;
    padding: 24px;
    border-radius: 18px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, .08);
    margin-bottom: 20px;
}

.section-card h3 {
    color: var(--color-primary);
    margin-bottom: 14px;
}

.section-card p {
    line-height: 1.6;
    overflow-wrap: anywhere;
    word-break: break-word;
}

.interaction-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.interaction-count {
    background: #f8f8f8;
    padding: 8px 12px;
    border-radius: 10px;
    color: var(--color-primary);
    font-weight: 600;
    white-space: nowrap;
}

.interaction-search {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #ddd;
    margin-bottom: 18px;
    font-size: 15px;
}

.empty {
    color: #777;
}

.interaction {
    padding: 16px;
    border-radius: 12px;
    background: #f8f8f8;
    margin-bottom: 14px;
}

.interaction h4 {
    margin-bottom: 4px;
    color: var(--color-primary);
    overflow-wrap: anywhere;
    word-break: break-word;
}

.interaction-id {
    color: #888;
    font-size: 0.9rem;
    margin-bottom: 8px;
}

.clickable {
    cursor: pointer;
    transition: 0.2s;
}

.clickable:hover {
    transform: translateY(-2px);
}

@media (max-width: 700px) {
    .drug-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>