<template>
    <div class="side-menu">
        <el-aside>
            <el-menu default-active="/main/home" :router="true" :collapse="true">
                <el-menu-item index="/main/home">
                    <el-icon>
                        <House />
                    </el-icon>
                    <template #title>首页</template>
                </el-menu-item>
                <el-menu-item index="/main/shortcutKeys">
                    <el-icon>
                        <Mouse />
                    </el-icon>
                    <template #title>快捷键</template>
                </el-menu-item>
                <el-menu-item index="/main/settings">
                    <el-icon>
                        <Tools />
                    </el-icon>
                    <template #title>设置</template>
                </el-menu-item>
            </el-menu>
        </el-aside>
    </div>
</template>

<script setup>

</script>

<style scoped>
.side-menu {
    width: auto;
    text-align: center;
    background-color: var(--el-menu-bg-color);
}

.side-menu>>>.el-aside {
    width: auto;
}

.side-menu>>>.el-menu-item {
    padding: 10px;
}

.side-menu>>>.el-menu-item.is-active {
    background-color: #f4f4f5;
}

.side-menu>>>.el-image {
    width: 50px;
}
</style>