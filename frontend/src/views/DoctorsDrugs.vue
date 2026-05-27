<script setup>
import { ref, onMounted } from "vue";
import MainLayout from "../components/MainLayout.vue";
import { api } from "../api/api";

const drugs = ref([]);
const search = ref("");
const loading = ref(false);
const expandedDrug = ref(null);

function toggleExpand(id) {
    expandedDrug.value = expandedDrug.value === id ? null : id;
}

function shortDescription(description) {
    if (!description) return "No description available.";
    if (description.length <= 220) return description;

    return description.substring(0, 220) + "...";
}

async function searchDrugs() {
    const query = search.value.trim();

    if (!query) {
        drugs.value = [];
        return;
    }

    loading.value = true;

    try {
        const res = await api.getDrugs(query);
        drugs.value = res.data || [];
    } catch (e) {
        console.log("Drug search failed:", e);
        drugs.value = [];
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    searchDrugs();
});
</script>

<template>
    <MainLayout title="Drug Directory">
        <div class="page">

            <div class="header">
                <div>
                    <h2>Drug Directory</h2>
                    <p>Search and browse medications.</p>
                </div>

                <div class="count">
                    {{ drugs.length }} results
                </div>
            </div>

            <input
                v-model="search"
                @input="searchDrugs"
                class="search"
                placeholder="Search drugs..."
            />

            <div v-if="loading" class="status">
                Loading...
            </div>

            <div v-else-if="drugs.length === 0" class="status">
                No drugs found
            </div>

            <div v-else class="drug-grid">
                <div v-for="drug in drugs" :key="drug._id" class="card">
                    <h3>{{ drug.name }}</h3>

                    <div class="id">
                        {{ drug.id || "No ID available" }}
                    </div>

                    <div class="description">
                        {{
                            expandedDrug === drug._id
                                ? (drug.description || "No description available.")
                                : shortDescription(drug.description)
                        }}
                    </div>

                    <button
                        v-if="drug.description && drug.description.length > 220"
                        class="expand-btn"
                        @click="toggleExpand(drug._id)"
                    >
                        {{ expandedDrug === drug._id ? "Show less" : "Read more" }}
                    </button>
                </div>
            </div>

        </div>
    </MainLayout>
</template>

<style scoped>
.page {
    padding: 10px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

h2 {
    margin: 0;
    color: var(--color-primary);
}

.header p {
    margin-top: 5px;
    color: #666;
}

.count {
    background: white;
    padding: 10px 16px;
    border-radius: 10px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, .08);
    font-weight: 600;
}

.search {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid #ddd;
    margin-bottom: 25px;
    font-size: 15px;
}

.drug-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 18px;
}

.card {
    background: white;
    padding: 24px;
    border-radius: 18px;
    border-left: 6px solid var(--color-primary);
    box-shadow: 0 6px 20px rgba(0, 0, 0, .08);
    overflow: hidden;
}

.card h3 {
    margin-bottom: 10px;
    color: var(--color-primary);
    overflow-wrap: anywhere;
    word-break: break-word;
}

.id {
    color: #888;
    margin-bottom: 14px;
}

.description {
    line-height: 1.6;
    white-space: pre-wrap;
}

.expand-btn {
    margin-top: 12px;
    border: none;
    background: none;
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
    padding: 0;
}

.expand-btn:hover {
    text-decoration: underline;
}

.status {
    padding: 50px;
    text-align: center;
    color: #777;
}
</style>